"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download, FilePlus, RotateCcw } from 'lucide-react'; 
import { 
  getCommitWithContent, 
  createDocumentFromCommit, // Renamed from createDocumentFromCommitContent for consistency
  revertToCommit 
} from '@/app/actions';

interface Commit { // Assuming a simplified Commit type passed to this component
  id: string;
  commit_message?: string | null; 
}

interface CommitActionsMenuProps {
  commit: Commit;
  documentId: string;
  currentBranchId: string; // Needed for revert if revertToCommit needs current branch context
  onRevertSuccess: (newContent: any) => void; 
}

const CommitActionsMenu: React.FC<CommitActionsMenuProps> = ({ 
  commit, 
  documentId, 
  currentBranchId, 
  onRevertSuccess 
}) => {
  const router = useRouter();
  const [isProcessing, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string, isError: boolean = false) => {
    setStatusMessage(msg);
    setError(isError ? msg : null);
    setTimeout(() => {
      setStatusMessage(null);
      if (isError) setError(null); // Clear error too
    }, 3000); // Hide message after 3 seconds
  };

  const handleDownload = async () => {
    setError(null);
    startTransition(async () => {
      showStatus("Downloading...");
      const result = await getCommitWithContent(commit.id);
      if (result.success && result.data) {
        const contentJson = JSON.stringify(result.data.content, null, 2);
        const blob = new Blob([contentJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `commit_${commit.id.substring(0,8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus("Downloaded successfully.");
      } else {
        showStatus(result.error || "Failed to fetch content for download.", true);
      }
    });
  };

  const handleOpenAsNew = async () => {
    setError(null);
    startTransition(async () => {
      showStatus("Creating new document...");
      // Fetch original commit's message to use in new title
      const originalCommitResult = await getCommitWithContent(commit.id);
      let titleForNewDoc = `Copy of commit ${commit.id.substring(0,8)}`;
      if(originalCommitResult.success && originalCommitResult.data?.commit_message) {
        titleForNewDoc = `Copy of: ${originalCommitResult.data.commit_message.substring(0,30)}`;
      }
      
      const newDocResult = await createDocumentFromCommit(commit.id, titleForNewDoc);
      if (newDocResult.success && newDocResult.data) {
        router.push(`/docs/${newDocResult.data.newDocumentId}/branch/${newDocResult.data.newMainBranchId}`);
        showStatus("New document created.");
      } else {
        showStatus(newDocResult.error || "Failed to create new document from commit.", true);
      }
    });
  };

  const handleRevert = async () => {
    setError(null);
    if (!window.confirm("Are you sure you want to revert? This creates a new commit with the content of this version.")) {
      return;
    }
    startTransition(async () => {
      showStatus("Reverting...");
      const result = await revertToCommit(commit.id, documentId); // Removed currentBranchId as revertToCommit uses main branch
      if (result.success && result.commit) {
        showStatus("Reverted successfully!");
        onRevertSuccess(result.commit.content); // Pass new content to refresh editor
      } else {
        showStatus(result.error || "Failed to revert to this commit.", true);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 data-[state=open]:bg-muted">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open commit actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleDownload} disabled={isProcessing}>
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenAsNew} disabled={isProcessing}>
            <FilePlus className="mr-2 h-4 w-4" />
            Open as New Document
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleRevert} disabled={isProcessing} className="text-red-500 focus:text-red-500 focus:bg-red-50/50">
            <RotateCcw className="mr-2 h-4 w-4" />
            Revert to this State
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {statusMessage && (
        <div className={`fixed bottom-4 right-4 p-3 rounded-md shadow-lg text-sm z-50 ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {statusMessage}
        </div>
      )}
    </>
  );
};
export default CommitActionsMenu;
