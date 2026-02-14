"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "e.g., Astrophysics, Pottery, React Native...";

interface HeroSectionProps {
  onSubmit?: (value: string) => void;
  className?: string;
}

export function HeroSection({ onSubmit, className }: HeroSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value?.trim();
    if (value) onSubmit?.(value);
  };

  return (
    <section
      className={cn(
        "flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 pt-14",
        className
      )}
    >
      <div className="w-full max-w-2xl text-center">
        {/* Headline */}
        <h1 className="mb-12 text-hero font-bold tracking-tight text-white">
          What do you want to learn{" "}
          <span className="gradient-text">today?</span>
        </h1>

        {/* Rainbow glass input container */}
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="glass-border-glow relative w-full rounded-xl p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={PLACEHOLDER}
              className="relative z-10 w-full bg-transparent px-5 py-4 text-lg text-white placeholder:text-neutral-500 focus:outline-none"
              aria-label="What do you want to learn?"
            />
          </div>
        </form>
      </div>
    </section>
  );
}
