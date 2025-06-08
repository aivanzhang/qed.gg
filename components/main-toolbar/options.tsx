{
  /* <Button
  variant="ghost"
  size="icon"
  onClick={onToggleOpen} // This button now collapses the toolbar
  className="hover:bg-foreground/10 text-foreground p-2 rounded-md mr-1"
  aria-label="Collapse toolbar"
>
  <PanelTopClose size={20} className="text-foreground" />
</Button>; */
}

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  PanelTopClose,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";
import InteractiveIcon from "@/components/ui/interactive-icon";

// Copied from main-toolbar/index.tsx - consider centralizing if used elsewhere
const actionsMenuVariants = {
  open: {
    opacity: 1,
    height: "auto",
    scaleY: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  closed: {
    opacity: 0,
    height: 0,
    scaleY: 0.95,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

interface OptionsProps {
  onToggleOpen: () => void; // For collapsing the parent MainToolbar
}

const Options: React.FC<OptionsProps> = ({ onToggleOpen }) => {
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);

  return (
    <DropdownMenu
      open={isActionsDropdownOpen}
      onOpenChange={setIsActionsDropdownOpen}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-foreground/10 text-foreground p-2 rounded-md" // Style from original trigger in MainToolbar
          aria-label="Toggle actions menu"
        >
          <InteractiveIcon ariaLabel="Open actions menu">
            <ChevronDown
              size={20}
              className={`text-foreground transition-transform duration-200 ${
                isActionsDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </InteractiveIcon>
        </Button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        {isActionsDropdownOpen && (
          <DropdownMenuContent
            asChild
            forceMount
            align="start"
            side="right"
            sideOffset={24}
            className="p-0 border-none shadow-none z-50 bg-background" // Container for motion.div
          >
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={actionsMenuVariants}
              className="origin-top-right bg-background shadow-xl rounded-lg border border-border p-1.5 min-w-[240px]"
            >
              <DropdownMenuItem
                onClick={onToggleOpen}
                className="group flex items-center space-x-2.5 p-2 cursor-pointer text-sm" // Added 'group' class
              >
                <InteractiveIcon ariaLabel="Collapse toolbar">
                  <PanelTopClose
                    size={16}
                    className="text-muted-foreground group-hover:text-primary-foreground"
                  />
                </InteractiveIcon>
                <span>Collapse Toolbar</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={() => alert("Preferences clicked!")}
                className="group flex items-center space-x-2.5 p-2 cursor-pointer text-sm"
              >
                <InteractiveIcon ariaLabel="Preferences">
                  <Settings
                    size={16}
                    className="text-muted-foreground group-hover:text-primary-foreground"
                  />
                </InteractiveIcon>
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => alert("Quick Actions clicked!")}
                className="group flex items-center space-x-2.5 p-2 cursor-pointer text-sm"
              >
                <InteractiveIcon ariaLabel="Quick Actions">
                  <Zap
                    size={16}
                    className="text-muted-foreground group-hover:text-primary-foreground"
                  />
                </InteractiveIcon>
                <span>Quick Actions</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={() => alert("Help clicked!")}
                className="group flex items-center space-x-2.5 p-2 cursor-pointer text-sm"
              >
                <InteractiveIcon ariaLabel="Help & Feedback">
                  <HelpCircle
                    size={16}
                    className="text-muted-foreground group-hover:text-primary-foreground"
                  />
                </InteractiveIcon>
                <span>Help & Feedback</span>
              </DropdownMenuItem>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
};

export default Options;
