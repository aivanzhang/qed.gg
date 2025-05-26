import { supabase } from "@/lib/supabaseClient"; 
import ReadOnlyEditor from "@/components/editor/ReadOnlyEditor";
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from "next/link"; // For a link back to the main site, if desired

interface SharePageParams {
  documentId: string;
}

interface SharePageProps {
  params: SharePageParams;
}

// Public data fetching function
async function getPublicDocument(documentId: string) {
  // RLS policy "Allow public read access to specific document fields" should allow this.
  // The anon key in supabaseClient must have SELECT grant on these columns.
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, description, current_content, updated_at') 
    .eq('id', documentId)
    .single();

  if (error) {
    console.error('Error fetching public document:', error.message);
    return null;
  }
  return data;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const document = await getPublicDocument(params.documentId);
  const pageTitle = document ? `${document.title} (Shared View) - QED.gg` : 'Shared Document - QED.gg';
  return {
    title: pageTitle,
    description: document?.description || "A shared document from QED.gg",
    // OpenGraph metadata for better social sharing
    openGraph: {
        title: pageTitle,
        description: document?.description || "View this shared document.",
        type: 'article',
        // Add more OpenGraph tags if needed, e.g., images, site_name
    },
  };
}

export default async function ShareDocumentPage({ params }: SharePageProps) {
  const { documentId } = params;
  const document = await getPublicDocument(documentId);

  if (!document || !document.current_content) {
    // If document not found, or if it has no content (e.g. current_content is null)
    notFound();
  }

  return (
    // Using a simplified layout, not necessarily the main app RootLayout if that includes user-specific elements
    <div className="min-h-screen bg-background-main text-text-primary font-sans">
      <header className="py-4 px-6 bg-ui-element shadow">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-primary hover:text-primary/80">
            QED.gg
          </Link>
          <span className="text-sm text-text-secondary">Shared Document</span>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 max-w-3xl mt-6">
        <article>
          <header className="mb-8 border-b border-border-divider pb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary break-words">
              {document.title}
            </h1>
            {document.description && (
              <p className="text-text-secondary mt-2 text-base">{document.description}</p>
            )}
            <p className="text-xs text-text-secondary mt-3">
              Last updated: {new Date(document.updated_at).toLocaleString()}
            </p>
          </header>
          
          <ReadOnlyEditor content={document.current_content} />
        </article>
      </main>

      <footer className="text-center py-8 mt-12 border-t border-border-divider">
        <p className="text-sm text-text-secondary">
          View more documents or create your own at <Link href="/" className="text-accent-blue hover:underline">QED.gg</Link>.
        </p>
      </footer>
    </div>
  );
}
