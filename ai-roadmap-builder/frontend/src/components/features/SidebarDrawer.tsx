"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapTitles: string[];
}

export function SidebarDrawer({
  isOpen,
  onClose,
  roadmapTitles,
}: SidebarDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      const onEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      document.addEventListener("keydown", onEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onEscape);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            role="presentation"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label="Your Roadmaps"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-[min(320px,85vw)] border-r border-white/10 bg-[#1a1a1e] shadow-2xl"
          >
            <div className="flex h-14 items-center border-b border-white/10 px-6">
              <h2 className="text-lg font-semibold text-white">
                Your Roadmaps
              </h2>
            </div>
            <div className="overflow-y-auto p-4">
              {roadmapTitles.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-500">
                  No roadmaps yet. Generate one from the home page.
                </p>
              ) : (
                <ul className="space-y-1">
                  {roadmapTitles.map((title, i) => (
                    <li key={`${title}-${i}`}>
                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                      >
                        {title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
