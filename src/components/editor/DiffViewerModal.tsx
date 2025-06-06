"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { getCommitWithContent } from '@/app/actions'; // Server action
import { diffLines, type Change } from 'diff'; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Added for an explicit close button
} from "@/components/ui/dialog"; // Assuming Shadcn UI Dialog is available

interface DiffViewerModalProps {
  selectedCommitId: string | null;
  currentBranchLatestCommitContent: any | null; // Content of the latest commit on the current branch
  isOpen: boolean;
  onClose: () => void;
}

interface CommitDetails {
  content: any;
  commit_message: string | null;
  created_at: string;
}

// Helper to stringify content for diffing
const safeStringify = (content: any, fallback: string = '{}'): string => {
  try {
    if (content === null || typeof content === 'undefined') return safeStringify(JSON.parse(fallback));
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content); // Fallback for non-JSON or already stringified
  }
};

const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  selectedCommitId,
  currentBranchLatestCommitContent,
  isOpen,
  onClose,
}) => {
  const [selectedCommitDetails, setSelectedCommitDetails] = useState<CommitDetails | null>(null);
  const [diffParts, setDiffParts] = useState<Change[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedCommitId) {
      setError(null);
      setDiffParts([]);
      setSelectedCommitDetails(null);
      startTransition(async () => {
        try {
          const result = await getCommitWithContent(selectedCommitId);
          if (result.success && result.data) {
            const fetchedCommit = result.data;
            setSelectedCommitDetails({
              content: fetchedCommit.content,
              commit_message: fetchedCommit.commit_message,
              created_at: fetchedCommit.created_at,
            });

            const oldContentStr = safeStringify(currentBranchLatestCommitContent, '{}');
            const newContentStr = safeStringify(fetchedCommit.content, '{}');
            
            // Only compute diff if comparing against something different
            // Or if currentBranchLatestCommitContent is null, then we are comparing the selected commit to an "empty" state or just showing its content
            if (currentBranchLatestCommitContent !== null || oldContentStr !== newContentStr) {
                 setDiffParts(diffLines(oldContentStr, newContentStr));
            } else {
                // If selected commit is the same as currentBranchLatestCommitContent, or no current content to compare
                // We can show the full content of selected commit as "added" or just display it plainly.
                // For now, let's treat it as all added if no currentBranchLatestCommitContent
                if (currentBranchLatestCommitContent === null) {
                    setDiffParts([{ value: newContentStr, added: true, count: newContentStr.split('\n').length }]);
                } else {
                     setDiffParts([{ value: newContentStr, count: newContentStr.split('\n').length }]); // No changes
                }
            }

          } else {
            throw new Error(result.error || "Failed to load selected commit details.");
          }
        } catch (err: any) {
          setError(err.message);
          console.error("Error loading commit for diff:", err);
        }
      });
    }
  }, [isOpen, selectedCommitId, currentBranchLatestCommitContent]);

  const renderDiff = () => {
    if (diffParts.length === 0 && !isLoading && !error) {
        // This might happen if selected content is identical to current content and no diff was generated
        // or if currentBranchLatestCommitContent was null and we only displayed selected.
        // Let's show the selected commit's content directly if no diff parts (e.g. it's the latest)
        if (selectedCommitDetails?.content) {
            return (
                 <pre className="whitespace-pre-wrap text-sm p-2 bg-ui-element rounded-md overflow-auto max-h-[60vh]">
                    {safeStringify(selectedCommitDetails.content)}
                 </pre>
            );
        }
        return <p className="text-text-secondary">No changes to display or content is current.</p>;
    }

    return (
      <pre className="whitespace-pre-wrap text-sm p-2 bg-ui-element rounded-md overflow-auto max-h-[60vh]">
        {diffParts.map((part, index) => {
          const color = part.added ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                      : part.removed ? 'bg-red-500/20 text-red-700 dark:text-red-300 line-through' 
                      : 'text-text-secondary dark:text-gray-400';
          const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
          return (
            <div key={index} className={`${color} block px-2`}>
              {part.value.split('\n').map((line, i, arr) => (
                // Avoid adding prefix to empty lines that result from split if original line ended with \n
                <span key={`${index}-${i}`} className="block"> 
                  {(line || i < arr.length -1 || arr.length === 1) ? prefix + line : line}
                </span>
              ))}
            </div>
          );
        })}
      </pre>
    );
  };
  
  // Handle Dialog open state via its own 'open' prop bound to 'isOpen'
  // and 'onOpenChange' to call 'onClose' when Dialog wants to close.
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-text-primary">
            Commit Details & Diff
          </DialogTitle>
          {selectedCommitDetails && (
            <DialogDescription className="text-text-secondary">
              Commit from: {new Date(selectedCommitDetails.created_at).toLocaleString()}
              <br />
              Message: {selectedCommitDetails.commit_message || <em>No commit message</em>}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto my-4">
          {isLoading && <p className="text-text-primary">Loading commit details...</p>}
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">Error: {error}</p>}
          {!isLoading && !error && selectedCommitDetails && renderDiff()}
          {!isLoading && !error && !selectedCommitDetails && isOpen && <p className="text-text-primary">Select a commit to view details.</p>}
        </div>

        <DialogFooter className="mt-auto">
          <DialogClose asChild>
            <button 
              onClick={onClose} 
              className="p-2 px-4 bg-ui-element text-text-primary rounded-md hover:bg-ui-element/80"
            >
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiffViewerModal;
