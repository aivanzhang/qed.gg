import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// TODO: Replace with actual document data and types
const placeholderFiles = [
  "README.md",
  "index.js",
  "App.tsx",
  "utils.ts",
  "config.json",
];

const DocumentsView: React.FC = () => {
  return (
    <div className="p-2 space-y-2 flex-grow flex flex-col overflow-hidden">
      <div className="px-1 pt-1">
        <Input
          type="search"
          placeholder="Search documents..."
          className="w-full h-9"
        />
      </div>
      <div className="flex-grow overflow-y-auto space-y-1 pr-1">
        {placeholderFiles.map((file) => (
          <div key={file}>
            <Button
              variant="ghost"
              className="w-full text-left justify-start px-2 py-1.5 text-sm text-foreground hover:text-accent-foreground hover:bg-accent/80 rounded-md truncate"
              title={file}
            >
              {file}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsView;
