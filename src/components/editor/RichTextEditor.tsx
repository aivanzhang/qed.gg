"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react'; 
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useState, useTransition, useCallback, forwardRef, useImperativeHandle } from 'react';
import { saveCommit, manualSaveCommit } from '@/app/actions'; 

interface RichTextEditorProps {
  initialContent: any; 
  documentId: string;
  branchId: string;
}

export interface EditorRefHandle {
  setContent: (newContent: any, emitUpdate?: boolean) => void;
  getEditor: () => Editor | null; 
}

const RichTextEditor = forwardRef<EditorRefHandle, RichTextEditorProps>(
  ({ initialContent, documentId, branchId }, ref) => {
    const [isDirty, setIsDirty] = useState(false);
    // REMOVE: isAutoSaving and isManualSaving local states
    // const [isAutoSaving, setIsAutoSaving] = useState(false);
    // const [isManualSaving, setIsManualSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [autoSavePending, startAutoSaveTransition] = useTransition();
    const [manualSavePending, startManualSaveTransition] = useTransition();

    const editor = useEditor({
      extensions: [
        StarterKit,
      ],
      content: initialContent,
      editable: true,
      onUpdate: ({ editor: currentEditor }) => {
        setIsDirty(true);
      },
      onBlur: ({ editor: currentEditor }) => {
        // Rely on autoSavePending for loading state
        if (isDirty && !autoSavePending && !manualSavePending) { 
          // setIsAutoSaving(true); // REMOVE
          setSaveError(null);
          startAutoSaveTransition(async () => {
            try {
              const result = await saveCommit({ 
                branchId,
                newContent: currentEditor.getJSON(),
                documentId,
              });
              if (result.success) {
                setIsDirty(false);
              } else {
                setSaveError(result.error || "Failed to auto-save content.");
              }
            } catch (err: any) {
              setSaveError(err.message || "An unexpected error occurred during auto-save.");
            } 
            // finally { setIsAutoSaving(false); } // REMOVE
          });
        }
      },
    });

    useImperativeHandle(ref, () => ({
      setContent: (newContent: any, emitUpdate: boolean = true) => {
        if (editor) {
          editor.commands.setContent(newContent, emitUpdate);
          setIsDirty(false); 
          setSaveError(null); 
        }
      },
      getEditor: () => editor,
    }));
    
    useEffect(() => {
        if (editor && initialContent && !editor.isFocused) { 
            if (JSON.stringify(editor.getJSON()) !== JSON.stringify(initialContent)) {
                editor.commands.setContent(initialContent, false);
                setIsDirty(false);
                setSaveError(null);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialContent, editor]); 


    const handleManualSave = useCallback(async () => {
      // Rely on manualSavePending for loading state
      if (!editor || manualSavePending || autoSavePending) return; 
      const commitMessageFromPrompt = window.prompt("Enter commit message (optional):");
      if (commitMessageFromPrompt === null) return;
      const commitMessage = commitMessageFromPrompt || `Manual save - ${new Date().toLocaleString()}`;

      // setIsManualSaving(true); // REMOVE
      setSaveError(null);
      startManualSaveTransition(async () => {
        try {
          const result = await manualSaveCommit({
            documentId,
            newContent: editor.getJSON(),
            commitMessage,
          });
          if (result.success) {
            setIsDirty(false); 
          } else {
            setSaveError(result.error || "Failed to manually save content.");
          }
        } catch (err: any) {
          setSaveError(err.message || "An unexpected error occurred during manual save.");
        } 
        // finally { setIsManualSaving(false); } // REMOVE
      });
    }, [editor, documentId, manualSavePending, autoSavePending, startManualSaveTransition]); // Added autoSavePending to deps

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 's') {
          event.preventDefault();
          handleManualSave();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [handleManualSave]);

    if (!editor) {
      return <p>Loading editor...</p>;
    }

    // Combined pending state for UI
    const isProcessingSave = autoSavePending || manualSavePending;

    return (
      <div className="border border-border-divider p-2 rounded-md">
        <div className="flex space-x-2 mb-4 p-2 border-b border-border-divider items-center">
          <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-ui-element p-1 rounded' : 'p-1 rounded hover:bg-ui-element/50'}>Bold</button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-ui-element p-1 rounded' : 'p-1 rounded hover:bg-ui-element/50'}>Italic</button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-ui-element p-1 rounded' : 'p-1 rounded hover:bg-ui-element/50'}>Strike</button>
          <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'bg-ui-element p-1 rounded' : 'p-1 rounded hover:bg-ui-element/50'}>Paragraph</button>
          <button 
            onClick={handleManualSave} 
            disabled={isProcessingSave} // Use combined pending state
            className="ml-auto p-1 px-2 rounded bg-accent-blue text-white hover:bg-accent-blue/80 disabled:opacity-50"
          >
            {isProcessingSave ? "Saving..." : "Save (Ctrl+S)"} 
          </button>
        </div>
        <EditorContent editor={editor} className="prose dark:prose-invert max-w-none focus:outline-none" />
        <div className="mt-2 text-xs h-4"> 
          {isProcessingSave && <span className="text-text-secondary">Saving...</span>}
          {/* Removed the "(Processing...)" part as isProcessingSave now covers the whole duration */}
          {!isProcessingSave && isDirty && <span className="text-accent-yellow">Unsaved changes</span>}
          {!isProcessingSave && !isDirty && <span className="text-accent-green">Saved</span>}
          {saveError && <span className="text-red-500 ml-2">Error: {saveError}</span>}
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;
