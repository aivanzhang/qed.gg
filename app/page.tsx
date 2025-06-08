"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import MainToolbar from "@/components/main-toolbar";
import LexicalEditor from "@/components/lexical-editor";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMainToolbarOpen, setIsMainToolbarOpen] = useState(true);

  const toggleMainToolbar = () => setIsMainToolbarOpen((prev) => !prev);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b" && e.shiftKey && e.metaKey) {
        e.preventDefault();
        if (!sidebarOpen && !isMainToolbarOpen) {
          setSidebarOpen(true);
          setIsMainToolbarOpen(true);
        } else {
          setSidebarOpen(false);
          setIsMainToolbarOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sidebarOpen, isMainToolbarOpen]);

  const mainContentMarginLeft = sidebarOpen ? "ml-64" : "ml-4";
  const mainContentPaddingTop = isMainToolbarOpen ? "pt-20" : "pt-4";

  return (
    <div className="relative flex h-screen w-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto ${mainContentMarginLeft} ${mainContentPaddingTop} pb-32 px-4`}
      >
        <div className="w-full h-full">
          <LexicalEditor />
        </div>
      </main>
      <MainToolbar
        isOpen={isMainToolbarOpen}
        onToggleOpen={toggleMainToolbar}
        // onToggleActions and isActionsOpen props removed
      />
    </div>
  );
}
