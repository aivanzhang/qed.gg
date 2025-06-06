"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, XCircle } from 'lucide-react'; // Added XCircle for error

interface ShareButtonProps {
  documentId: string;
  documentTitle?: string; 
}

const ShareButton: React.FC<ShareButtonProps> = ({ documentId, documentTitle }) => {
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${documentId}` : '';

  const handleCopyToClipboard = async () => {
    if (!shareUrl) {
      console.error("Share URL is not available.");
      setFeedback({ message: "Error: Link unavailable.", isError: true });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback({ message: "Link Copied!", isError: false });
      setTimeout(() => setFeedback(null), 2500); 
    } catch (err) {
      console.error('Failed to copy share link:', err);
      setFeedback({ message: "Failed to copy link.", isError: true });
      setTimeout(() => setFeedback(null), 3000);
    }
  };
  
  let buttonContent;
  if (feedback) {
    if (feedback.isError) {
      buttonContent = (
        <>
          <XCircle className="h-4 w-4 text-red-500" /> {feedback.message}
        </>
      );
    } else {
      buttonContent = (
        <>
          <Check className="h-4 w-4 text-green-500" /> {feedback.message}
        </>
      );
    }
  } else {
    buttonContent = (
      <>
        <Share2 className="h-4 w-4" /> Share
      </>
    );
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleCopyToClipboard} 
      className="gap-2 items-center text-sm h-9 px-3 w-[150px] justify-center" // Fixed width for consistent size
      disabled={!!feedback} // Disable button during feedback display
    >
      {buttonContent}
    </Button>
  );
};

export default ShareButton;
