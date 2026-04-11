import type { ReactNode } from "react";

type BrandedPanelProps = {
  children: ReactNode;
  className?: string;
};

/** Outer frame aligned with main FRONTEND BrandedShell. */
export default function BrandedPanel({ children, className }: BrandedPanelProps) {
  return (
    <div
      className={[
        "w-full border-2 border-[#43574C] bg-black/65 px-4 py-6 shadow-xl md:px-8 md:py-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
