import React from "react";
import { motion } from "framer-motion";

interface InteractiveIconProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const InteractiveIcon: React.FC<InteractiveIconProps> = ({
  children,
  onClick,
  className,
  ariaLabel,
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileTap={{ scale: 0.9, rotate: -5 }} // whileHover is removed, will be handled by Tailwind group-hover
      className={`cursor-pointer inline-flex items-center justify-center transition-transform duration-150 ease-in-out group-hover:scale-110 group-hover:rotate-5 ${
        className || ""
      }`}
      aria-label={ariaLabel}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export default InteractiveIcon;
