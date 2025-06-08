import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, PanelLeftClose } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SidebarTopBar, { SidebarTab } from "./sidebar-top-bar";
import DocumentsView from "./documents-view";
import HistoryView from "./history-view";
import ExtensionsView from "./extensions-view";

export interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const sidebarVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.3 },
  },
  closed: {
    x: "-100%",
    opacity: 0.8,
    transition: { type: "spring", stiffness: 300, damping: 30, duration: 0.3 },
  },
};

const collapsedTabVariants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  hidden: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('documents');
  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            key="collapsed-sidebar-tab"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={collapsedTabVariants}
            className={`fixed top-1/2 transform -translate-y-1/2 left-0 w-4 h-24 rounded-l-none rounded-r-md bg-accent hover:bg-accent/90 cursor-pointer z-40 flex items-center justify-center shadow-md`}
            onClick={() => setOpen(true)}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={14} className="text-primary-foreground" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sidebar-panel"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className={`fixed top-0 left-0 bottom-0 w-64 bg-background shadow-xl rounded-r-lg flex flex-col z-40 border-r border-border`}
            // Removed: transition-all duration-300 ease-in-out (handled by framer-motion)
          >
                        <div className="flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center p-1 pr-2 border-b">
                <SidebarTopBar activeTab={activeTab} setActiveTab={setActiveTab} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  aria-label="Collapse sidebar"
                  className="ml-auto h-9 w-9"
                >
                  <PanelLeftClose size={20} />
                </Button>
              </div>
              <div className="flex-grow overflow-y-auto">
                {activeTab === 'documents' && <DocumentsView />}
                {activeTab === 'history' && <HistoryView />}
                {activeTab === 'extensions' && <ExtensionsView />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
