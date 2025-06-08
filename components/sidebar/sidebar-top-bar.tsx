import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Files, History, Blocks } from "lucide-react";

export type SidebarTab = "documents" | "history" | "extensions";

interface SidebarTopBarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
}

const tabs: { name: SidebarTab; label: string; icon: React.ElementType }[] = [
  { name: "documents", label: "Documents", icon: Files },
  { name: "history", label: "History", icon: History },
  { name: "extensions", label: "Extensions", icon: Blocks },
];

const SidebarTopBar: React.FC<SidebarTopBarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center justify-start px-2 py-1 space-x-1.5 bg-background">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <Tooltip key={tab.name} delayDuration={500}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveTab(tab.name)}
                  aria-label={tab.label}
                  className={`
                    h-9 w-9 rounded-lg
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    transition-colors duration-150
                    ${
                      isActive
                        ? "text-secondary-foreground shadow-inner"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  <tab.icon size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-popover text-popover-foreground text-xs px-2 py-1"
              >
                <p>{tab.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default SidebarTopBar;
