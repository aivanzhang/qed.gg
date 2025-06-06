"use server";

import { supabase } from "@/lib/supabaseClient"; 

// Standardized return type for most actions
interface ActionResult<T = null> {
  success: boolean;
  data: T | null;
  error: string | null;
}

interface DocumentData {
  documentId: string;
  branchId: string;
  title: string;
}

interface CommitData {
  id: string;
  content: any;
  commit_message: string | null;
  created_at: string;
}

export async function createDocument(initialContentOverride?: any, titleOverride?: string): Promise<ActionResult<DocumentData>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated:", userError);
      return { success: false, data: null, error: "User not authenticated. Please log in." };
    }

    const initialTitle = titleOverride || "Untitled Document";
    const initialContent = initialContentOverride || { type: "doc", content: [{ type: "paragraph" }] };
    
    const { data: newDocument, error: docError } = await supabase
      .from("documents")
      .insert({ title: initialTitle, user_id: user.id, current_content: initialContent })
      .select("id, title")
      .single();

    if (docError || !newDocument) {
      console.error("Error creating document:", docError);
      return { success: false, data: null, error: docError?.message || "Failed to create document." };
    }
    const documentId = newDocument.id;

    const defaultBranchName = "main";
    const { data: newBranch, error: branchError } = await supabase
      .from("document_branches")
      .insert({ document_id: documentId, user_id: user.id, name: defaultBranchName, is_default: true })
      .select("id")
      .single();

    if (branchError || !newBranch) {
      console.error("Error creating branch for document:", documentId, branchError);
      return { success: false, data: null, error: branchError?.message || "Failed to create document branch." };
    }
    const branchId = newBranch.id;

    const { error: commitError } = await supabase
      .from("document_commits")
      .insert({
        branch_id: branchId, user_id: user.id, content: initialContent, 
        commit_message: titleOverride ? `Initial commit from: ${titleOverride.substring(0,50)}` : "Initial commit",
      });

    if (commitError) {
      console.error("Error creating initial commit for branch:", branchId, commitError);
      return { success: false, data: null, error: commitError?.message || "Failed to create initial commit." };
    }

    console.log("Document created successfully:", { documentId, branchId, title: newDocument.title });
    return { success: true, data: { documentId, branchId, title: newDocument.title }, error: null };

  } catch (e: any) {
    console.error("Unexpected error in createDocument Server Action:", e);
    return { success: false, data: null, error: e.message || "An unexpected server error occurred." };
  }
}

interface SaveCommitPayload {
  branchId: string; 
  newContent: any;  
  documentId: string; 
}

export async function saveCommit({ branchId, newContent, documentId }: SaveCommitPayload): Promise<ActionResult<{commit: CommitData}>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated for saveCommit:", userError);
      return { success: false, data: null, error: "User not authenticated."};
    }

    const commitMessage = "Auto-save at " + new Date().toISOString();
    const { data: newCommitData, error: commitError } = await supabase
      .from("document_commits")
      .insert({ branch_id: branchId, user_id: user.id, content: newContent, commit_message: commitMessage })
      .select("id, content, commit_message, created_at") 
      .single();

    if (commitError || !newCommitData) {
      console.error("Error inserting new commit (auto-save):", commitError);
      return { success: false, data: null, error: commitError?.message || "Failed to save changes (auto-save)." };
    }

    const { error: updateDocError } = await supabase
      .from("documents")
      .update({ updated_at: new Date().toISOString(), current_content: newContent })
      .eq("id", documentId);

    if (updateDocError) {
      console.warn("Warning: Failed to update document's updated_at or current_content (auto-save):", updateDocError);
    }
    
    console.log("Auto-save commit successful:", newCommitData.id);
    return { success: true, data: { commit: newCommitData as CommitData }, error: null };

  } catch (e: any) {
    console.error("Unexpected error in saveCommit (auto-save) Server Action:", e);
    return { success: false, data: null, error: e.message || "An unexpected server error occurred during auto-save." };
  }
}


interface ManualSaveCommitPayload {
  documentId: string;
  newContent: any; 
  commitMessage: string;
}

export async function manualSaveCommit({ documentId, newContent, commitMessage }: ManualSaveCommitPayload): Promise<ActionResult<{commit: CommitData}>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated for manualSaveCommit:", userError);
      return { success: false, data: null, error: "User not authenticated." };
    }

    const { data: branchData, error: branchError } = await supabase
      .from("document_branches")
      .select("id")
      .eq("document_id", documentId)
      .or("is_default.eq.true,name.eq.main") 
      .limit(1)
      .single();

    if (branchError || !branchData) {
      console.error("Error fetching main/default branch:", branchError);
      return { success: false, data: null, error: branchError?.message || "Could not find main branch for this document." };
    }
    const mainBranchId = branchData.id;

    const finalCommitMessage = commitMessage || ("Manual save at " + new Date().toISOString());
    const { data: newCommitData, error: commitError } = await supabase
      .from("document_commits")
      .insert({ branch_id: mainBranchId, user_id: user.id, content: newContent, commit_message: finalCommitMessage })
      .select("id, content, commit_message, created_at") 
      .single();

    if (commitError || !newCommitData) {
      console.error("Error inserting new commit (manual save):", commitError);
      return { success: false, data: null, error: commitError?.message || "Failed to save changes (manual save)." };
    }

    const { error: updateDocError } = await supabase
      .from("documents")
      .update({ updated_at: new Date().toISOString(), current_content: newContent })
      .eq("id", documentId);

    if (updateDocError) {
      console.warn("Warning: Failed to update document's updated_at or current_content (manual save):", updateDocError);
    }

    console.log("Manual save commit successful:", newCommitData.id);
    return { success: true, data: { commit: newCommitData as CommitData }, error: null };

  } catch (e: any) {
    console.error("Unexpected error in manualSaveCommit Server Action:", e);
    return { success: false, data: null, error: e.message || "An unexpected server error occurred during manual save." };
  }
}

interface BranchSummary { id: string; name: string; created_at: string; is_default: boolean; user_id: string; }
export async function getDocumentBranches(documentId: string): Promise<ActionResult<BranchSummary[]>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated for getDocumentBranches:", userError);
      return { success: false, data: null, error: "User not authenticated." };
    }

    const { data: branches, error } = await supabase
      .from("document_branches")
      .select("id, name, created_at, is_default, user_id")
      .eq("document_id", documentId)
      .order("is_default", { ascending: false }) 
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching document branches:", error);
      return { success: false, data: null, error: error.message };
    }
    return { success: true, data: branches as BranchSummary[], error: null };
  } catch (e: any) {
    console.error("Unexpected error in getDocumentBranches:", e);
    return { success: false, data: null, error: e.message || "An unexpected error occurred." };
  }
}

interface CommitSummary { id: string; commit_message: string | null; created_at: string; user_id: string; }
export async function getBranchCommits(branchId: string): Promise<ActionResult<CommitSummary[]>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated for getBranchCommits:", userError);
      return { success: false, data: null, error: "User not authenticated." };
    }

    const { data: commits, error } = await supabase
      .from("document_commits")
      .select("id, commit_message, created_at, user_id") 
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching branch commits:", error);
      return { success: false, data: null, error: error.message };
    }
    return { success: true, data: commits as CommitSummary[], error: null };
  } catch (e: any) {
    console.error("Unexpected error in getBranchCommits:", e);
    return { success: false, data: null, error: e.message || "An unexpected error occurred." };
  }
}

interface FullCommitData extends CommitData { branch_id: string; }
export async function getCommitWithContent(commitId: string): Promise<ActionResult<FullCommitData>> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User not authenticated for getCommitWithContent:", userError);
      return { success: false, data: null, error: "User not authenticated." };
    }

    const { data: commit, error } = await supabase
      .from("document_commits")
      .select("id, content, commit_message, created_at, branch_id") 
      .eq("id", commitId)
      .single();

    if (error || !commit) {
      console.error("Error fetching commit with content:", error);
      return { success: false, data: null, error: error?.message || "Commit not found." };
    }
    return { success: true, data: commit as FullCommitData, error: null };
  } catch (e: any) {
    console.error("Unexpected error in getCommitWithContent:", e);
    return { success: false, data: null, error: e.message || "An unexpected error occurred." };
  }
}

interface NewDocFromCommitData { newDocumentId: string; newMainBranchId: string; title: string; }
export async function createDocumentFromCommit(sourceCommitId: string, newDocumentTitle?: string): Promise<ActionResult<NewDocFromCommitData>> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(); // Re-check auth for this specific action too
    if (authError || !user) {
      return { success: false, data: null, error: "User not authenticated." };
    }

    const sourceCommitResult = await getCommitWithContent(sourceCommitId);
    if (!sourceCommitResult.success || !sourceCommitResult.data) {
      return { success: false, data: null, error: sourceCommitResult.error || "Failed to fetch source commit content." };
    }

    const title = newDocumentTitle || `Copy of commit ${sourceCommitId.substring(0, 8)}`;
    const creationResult = await createDocument(sourceCommitResult.data.content, title); 

    if (!creationResult.success || !creationResult.data) {
        return { success: false, data: null, error: creationResult.error || "Failed to create new document from commit." };
    }
    
    return { 
      success: true, 
      data: { 
        newDocumentId: creationResult.data.documentId, 
        newMainBranchId: creationResult.data.branchId, 
        title: creationResult.data.title 
      },
      error: null
    };

  } catch (e: any) {
    console.error("Unexpected error in createDocumentFromCommit:", e);
    return { success: false, data: null, error: e.message || "An unexpected error occurred." };
  }
}

export async function revertToCommit(targetCommitId: string, currentDocumentId: string): Promise<ActionResult<{commit: CommitData}>> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(); // Re-check auth
    if (authError || !user) {
      return { success: false, data: null, error: "User not authenticated."};
    }

    const targetCommitResult = await getCommitWithContent(targetCommitId);
    if (!targetCommitResult.success || !targetCommitResult.data) {
      return { success: false, data: null, error: targetCommitResult.error || "Target commit not found."};
    }
    const revertContent = targetCommitResult.data.content;

    const commitMessage = `Reverted to state of commit ${targetCommitId.substring(0, 8)}`;
    const saveResult = await manualSaveCommit({
      documentId: currentDocumentId,
      newContent: revertContent,
      commitMessage: commitMessage,
    });

    if (!saveResult.success || !saveResult.data) { // manualSaveCommit now returns data: {commit}
      return { success: false, data: null, error: saveResult.error || "Failed to save revert commit."};
    }

    return { success: true, data: { commit: saveResult.data.commit }, error: null };

  } catch (e: any) {
    console.error("Unexpected error in revertToCommit:", e);
    return { success: false, data: null, error: e.message || "An unexpected error occurred during revert."};
  }
}
