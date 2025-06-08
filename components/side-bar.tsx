import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, PanelLeftClose } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
            <div className="flex justify-between items-center p-2 border-b">
              <span className="px-2 text-sm font-medium text-foreground">
                Files
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={20} />
              </Button>
            </div>
            <div className="p-2 space-y-1 flex-grow overflow-y-auto">
              {[
                "README.md",
                "index.js",
                "App.tsx",
                "utils.ts",
                "config.json",
              ].map((file) => (
                <div key={file}>
                  <Button
                    variant="ghost"
                    className="w-full text-left justify-start px-2 py-1.5 text-sm text-foreground hover:text-accent hover:bg-accent/10 rounded-md truncate"
                    title={file}
                  >
                    {file}
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
