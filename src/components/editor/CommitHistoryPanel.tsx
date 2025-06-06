"use client";

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { getDocumentBranches, getBranchCommits } from '@/app/actions'; 
import DiffViewerModal from './DiffViewerModal'; 
import CommitActionsMenu from './CommitActionsMenu'; // Import the new menu

interface Branch {
  id: string;
  name: string;
  created_at: string;
  is_default: boolean;
  user_id: string;
}

interface Commit {
  id: string;
  commit_message: string | null;
  created_at: string;
  user_id: string;
}

interface CommitHistoryPanelProps {
  documentId: string;
  currentBranchId: string; 
  latestContentOfCurrentBranch: any | null; 
  refreshEditorContent: (newContent: any) => void; // Callback to refresh editor
}

const CommitHistoryPanel: React.FC<CommitHistoryPanelProps> = ({ 
  documentId, 
  currentBranchId,
  latestContentOfCurrentBranch,
  refreshEditorContent // New prop
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(currentBranchId);
  const [commits, setCommits] = useState<Commit[]>([]);
  
  const [isLoadingBranches, startBranchesTransition] = useTransition();
  const [isLoadingCommits, startCommitsTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [showDiffModal, setShowDiffModal] = useState(false);
  const [commitIdForDiff, setCommitIdForDiff] = useState<string | null>(null);

  const fetchBranches = useCallback(() => {
    setError(null);
    startBranchesTransition(async () => {
      try {
        const result = await getDocumentBranches(documentId);
        if (result.success && result.data) {
          setBranches(result.data);
          if (!result.data.find(b => b.id === selectedBranchId)) {
            const current = result.data.find(b => b.id === currentBranchId);
            if (current) {
              setSelectedBranchId(current.id);
            } else if (result.data.length > 0) {
              setSelectedBranchId(result.data[0].id);
            }
          }
        } else {
          throw new Error(result.error || "Failed to load branches.");
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error loading branches:", err);
      }
    });
  }, [documentId, selectedBranchId, currentBranchId]);

  const fetchCommits = useCallback(() => {
    if (!selectedBranchId) {
      setCommits([]);
      return;
    }
    setError(null);
    startCommitsTransition(async () => {
      try {
        const result = await getBranchCommits(selectedBranchId);
        if (result.success && result.data) {
          setCommits(result.data);
        } else {
          throw new Error(result.error || "Failed to load commits.");
        }
      } catch (err: any) {
        setError(err.message);
        console.error(`Error loading commits for branch ${selectedBranchId}:`, err);
      }
    });
  }, [selectedBranchId]);

  useEffect(() => {
    fetchBranches();
  }, [documentId, fetchBranches]);

  useEffect(() => {
    fetchCommits();
  }, [selectedBranchId, fetchCommits]);

  const handleCommitClickForDiff = (commitId: string) => {
    setCommitIdForDiff(commitId);
    setShowDiffModal(true);
  };

  return (
    <>
      <div className="border border-border-divider rounded-lg p-4 bg-background-main h-full flex flex-col">
        <h3 className="text-xl font-semibold text-text-primary mb-4 border-b border-border-divider pb-2">
          Version History
        </h3>
        
        <div className="mb-6">
          <label htmlFor="branch-select" className="block text-sm font-medium text-text-secondary mb-1">Branch:</label>
          {isLoadingBranches ? (
            <div className="w-full p-2 border border-input rounded-md bg-ui-element/30 animate-pulse h-[40px]"></div>
          ) : (
            <select 
              id="branch-select" 
              value={selectedBranchId} 
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="block w-full p-2 border border-input rounded-md bg-ui-element text-text-primary focus:ring-ring focus:border-ring text-sm"
            >
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} {branch.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          <h4 className="text-md font-semibold text-text-primary mb-2 sticky top-0 bg-background-main pb-1">
            Commits on <span className="font-bold">{branches.find(b => b.id === selectedBranchId)?.name || 'selected branch'}</span>
          </h4>
          {isLoadingCommits ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-2.5 border border-ui-element/30 rounded-md animate-pulse">
                <div className="h-4 bg-ui-element/30 rounded w-3/4 mb-1.5"></div>
                <div className="h-3 bg-ui-element/30 rounded w-1/2"></div>
              </div>
            ))
          ) : commits.length === 0 ? (
            <p className="text-text-secondary text-sm px-2.5">No commits found for this branch.</p>
          ) : (
            commits.map(commit => (
              <div 
                key={commit.id} 
                className="p-2.5 border border-ui-element rounded-md hover:bg-ui-element/50 transition-colors duration-150 flex justify-between items-center group"
              >
                <div onClick={() => handleCommitClickForDiff(commit.id)} className="cursor-pointer flex-grow">
                  <p className="text-sm text-text-primary truncate font-medium" title={commit.commit_message || "No commit message"}>
                    {commit.commit_message || "No commit message"}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {new Date(commit.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <CommitActionsMenu 
                    commit={commit} 
                    documentId={documentId}
                    currentBranchId={currentBranchId} // Pass currentBranchId for context if revert targets current branch
                    onRevertSuccess={refreshEditorContent} 
                  />
                </div>
              </div>
            ))
          )}
        </div>
        {error && <p className="text-red-500 text-sm mt-4 p-2 bg-red-100 border border-red-400 rounded-md">Error: {error}</p>}
      </div>

      {showDiffModal && commitIdForDiff && (
        <DiffViewerModal
          selectedCommitId={commitIdForDiff}
          currentBranchLatestCommitContent={latestContentOfCurrentBranch}
          isOpen={showDiffModal}
          onClose={() => setShowDiffModal(false)}
        />
      )}
    </>
  );
};

export default CommitHistoryPanel;
