"use client";

import { Button } from "@/components/ui/button";
import { PanelRightOpen } from "lucide-react"; // Or another suitable icon

interface HistorySheetToggleProps {
  onClick: () => void;
}

const HistorySheetToggle: React.FC<HistorySheetToggleProps> = ({ onClick }) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="md:hidden" // Only show on small screens (hidden on md and up)
    >
      <PanelRightOpen className="h-5 w-5" />
      <span className="sr-only">Toggle History Panel</span>
    </Button>
  );
};

export default HistorySheetToggle;
