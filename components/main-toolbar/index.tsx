import React, { useState } from "react";
import { Button } from "@/components/ui/button";

import { AnimatePresence, motion } from "framer-motion"; // Added for animations
import {
  MousePointer2,
  Hand,
  Pencil,
  Eraser,
  Minus,
  Type,
  Image as ImageIconLucide,
  Square,
  ChevronDown,
} from "lucide-react";
import Options from "@/components/main-toolbar/options";

const tools = [
  { id: "cursor", icon: MousePointer2, label: "Select" },
  { id: "hand", icon: Hand, label: "Pan" },
  { id: "pencil", icon: Pencil, label: "Draw" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "text", icon: Type, label: "Text" },
  { id: "image", icon: ImageIconLucide, label: "Image" },
  { id: "shape", icon: Square, label: "Shape" },
];

interface MainToolbarProps {
  isOpen: boolean;
  onToggleOpen: () => void; // To toggle the entire toolbar's visibility
  // onToggleActions and isActionsOpen are removed as dropdown manages its own state
}

const mainToolbarVariants = {
  open: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  closed: {
    opacity: 0,
    y: -30,
    height: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const MainToolbar: React.FC<MainToolbarProps> = ({ isOpen, onToggleOpen }) => {
  const [activeTool, setActiveTool] = useState<string>("cursor");
  // const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false); // State moved to Options.tsx

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="collapsed-main-toolbar-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onClick={onToggleOpen}
            className="fixed top-0 left-1/2 transform -translate-x-1/2 w-24 h-4 rounded-t-none rounded-b-md bg-accent hover:bg-accent/90 cursor-pointer z-40 flex items-center justify-center shadow-md"
            aria-label="Expand toolbar"
          >
            <ChevronDown size={14} className="text-primary-foreground" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="main-toolbar-content-wrapper"
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mainToolbarVariants}
          >
            <div
              className="bg-background shadow-xl rounded-xl p-2 flex items-center space-x-1 border border-border"
              style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
            >
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveTool(tool.id)}
                  className={`p-2 rounded-md ${
                    activeTool === tool.id
                      ? "text-accent-foreground bg-accent hover:bg-accent/90"
                      : "text-foreground hover:bg-foreground/10"
                  }`}
                  aria-label={tool.label}
                >
                  <tool.icon
                    size={20}
                    className={
                      activeTool === tool.id
                        ? "text-accent-foreground"
                        : "text-foreground"
                    }
                  />
                </Button>
              ))}
              <div className="h-6 w-px bg-border mx-1"></div>

              <Options onToggleOpen={onToggleOpen} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MainToolbar;
