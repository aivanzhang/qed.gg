"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';

interface ReadOnlyEditorProps {
  content: any; // JSONB content from Supabase
}

const ReadOnlyEditor: React.FC<ReadOnlyEditorProps> = ({ content }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // Consider adding other extensions used during editing if they affect rendering
      // e.g., Link, Image, Typography, etc.
    ],
    content: content,
    editable: false, // Key for read-only mode
  });

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-text-secondary">Loading content...</p>
      </div>
    );
  }

  return (
    // Using Tailwind Typography for basic styling of rendered HTML
    <div className="prose dark:prose-invert max-w-none p-2"> 
      <EditorContent editor={editor} />
    </div>
  );
};

export default ReadOnlyEditor;
