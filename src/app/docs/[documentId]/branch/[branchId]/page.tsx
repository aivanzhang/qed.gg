"use client"; 

import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { supabase } from "@/lib/supabaseClient"; 
import RichTextEditor, { type EditorRefHandle } from "@/components/editor/RichTextEditor"; // Import EditorRefHandle
import CommitHistoryPanel from "@/components/editor/CommitHistoryPanel"; 
import ShareButton from "@/components/editor/ShareButton"; 
import HistorySheetToggle from "@/components/editor/HistorySheetToggle"; 
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"; 
import { notFound, useParams } from 'next/navigation'; 

interface DocumentDetails {
  id: string;
  title: string;
  description: string | null;
}

async function getDocumentDetailsClient(documentId: string): Promise<DocumentDetails | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, description')
    .eq('id', documentId)
    .single();
  if (error) {
    console.error('Error fetching document details (client):', error.message);
    return null;
  }
  return data;
}

async function getBranchLatestCommitContentClient(branchId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('document_commits')
    .select('content')
    .eq('branch_id', branchId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle(); 
  if (error) {
    console.error('Error fetching latest commit (client):', error.message);
    return { type: "doc", content: [{ type: "paragraph", content: [{type: "text", text: "Error loading content."}] }] }; 
  }
  return data ? data.content : { type: "doc", content: [{ type: "paragraph" }] }; 
}


export default function DocumentEditorPage() {
  const params = useParams<{ documentId: string; branchId: string }>(); 
  const { documentId, branchId } = params;

  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [editorContent, setEditorContent] = useState<any | null>(null); // This will still hold the content for initial load
  const [isLoading, setIsLoading] = useState(true);
  // const [editorKey, setEditorKey] = useState(Date.now()); // REMOVE: editorKey is no longer needed
  const [isSheetOpen, setIsSheetOpen] = useState(false); 
  
  const editorRef = useRef<EditorRefHandle>(null); // Create a ref for RichTextEditor

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const docDetails = await getDocumentDetailsClient(documentId);
      if (!docDetails) {
        notFound(); 
        return;
      }
      setDocumentDetails(docDetails);

      const content = await getBranchLatestCommitContentClient(branchId);
      setEditorContent(content); // Set content for initial load
      // editorRef.current?.setContent(content, false); // Also possible here after editor is mounted
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, branchId]);

  useEffect(() => {
    if (documentId && branchId) {
      fetchInitialData();
    }
  }, [documentId, branchId, fetchInitialData]);

  const refreshEditorContent = useCallback(async (newContent?: any) => {
    let contentToSet = newContent;
    if (!contentToSet) { 
      // If newContent is not directly provided, re-fetch the latest for the current branch
      contentToSet = await getBranchLatestCommitContentClient(branchId);
    }
    
    if (editorRef.current && contentToSet) {
      editorRef.current.setContent(contentToSet, true); // emitUpdate: true, to make editor dirty
      // Auto-save on blur will handle saving this new state.
      // Or, if immediate save is desired after revert:
      // editorRef.current.getEditor()?.commands.blur(); // This might trigger auto-save
    } else if (contentToSet) {
      // If editorRef is not yet available (e.g. during initial load path before editor mounts)
      // update the state that will be passed as initialContent.
      setEditorContent(contentToSet);
    }
    // REMOVE: No longer using editorKey to force re-mount
    // setEditorKey(Date.now()); 
  }, [branchId]); // editorRef is stable, so not needed in deps


  if (isLoading || !documentDetails || editorContent === null) {
    return (
      <div className="flex items-center justify-center h-full text-text-primary">
        Loading document...
      </div>
    );
  }
  
  return (
    <div className="flex flex-row flex-grow w-full h-full overflow-hidden">
      <div className="flex-grow flex flex-col p-4 md:p-6 overflow-y-auto h-full">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-grow"> 
              <h1 className="text-3xl font-bold text-text-primary break-words">
                {documentDetails?.title || "Untitled Document"}
              </h1>
              {documentDetails?.description && (
                <p className="text-text-secondary mt-1">{documentDetails.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0"> 
              <ShareButton documentId={documentId} documentTitle={documentDetails?.title} />
              <HistorySheetToggle onClick={() => setIsSheetOpen(true)} />
            </div>
          </div>
        </div>
        
        <div className="flex-grow w-full">
          <RichTextEditor 
            ref={editorRef} // Assign the ref
            // key={editorKey} // REMOVE: No longer using key-based re-mount for content changes
            initialContent={editorContent} 
            documentId={documentId}
            branchId={branchId}
          />
        </div>
      </div>

      <aside className="hidden md:flex md:flex-col w-80 lg:w-96 border-l border-border-divider p-0 flex-shrink-0 h-full overflow-y-auto">
        <CommitHistoryPanel 
          documentId={documentId} 
          currentBranchId={branchId} 
          latestContentOfCurrentBranch={editorContent} 
          refreshEditorContent={refreshEditorContent}
        />
      </aside>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[320px] sm:w-[400px] p-0 flex flex-col" side="right">
          <SheetHeader className="p-4 border-b border-border-divider">
            <SheetTitle>Version History</SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            <CommitHistoryPanel 
              documentId={documentId} 
              currentBranchId={branchId} 
              latestContentOfCurrentBranch={editorContent} 
              refreshEditorContent={(newContent) => {
                refreshEditorContent(newContent);
                setIsSheetOpen(false); 
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
