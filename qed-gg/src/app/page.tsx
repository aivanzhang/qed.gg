"use client"; // Required for useRouter and event handlers

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createDocument } from './actions'; // Assuming actions.ts is in the app directory

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCreateDocument = async () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createDocument();

        if (result.error || !result.data) {
          throw new Error(result.error || "Failed to create document: No data returned.");
        }

        const { documentId, branchId } = result.data;
        // Navigate to the new document's main branch editor page
        // Assuming a route structure like /docs/[documentId]/branch/[branchId]
        router.push(`/docs/${documentId}/branch/${branchId}`);
      } catch (err: any) {
        console.error("Failed to create document:", err);
        setError(err.message || "An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-background-main py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <Button 
          size="lg" 
          onClick={handleCreateDocument} 
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create New Document"}
        </Button>
        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-100 border border-red-400 p-3 rounded-md">
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
}
