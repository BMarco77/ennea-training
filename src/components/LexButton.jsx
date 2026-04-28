import React from "react";

/**
 * Lexikon-Style Button (Tailwind)
 * Props:
 * - active: boolean  -> ob der Button "selected" ist
 * - className: string -> optionale Zusatzklassen
 * - children -> Button-Text/Inhalt
 * - ...props -> onClick, type, disabled, etc.
 */
export default function LexButton({
  active = false,
  className = "",
  children,
  ...props
}) {
const base =
  "px-4 py-2 text-sm font-medium min-w-[60px] text-center cursor-pointer " +
  "rounded-lg border border-black/40 " +
  "bg-[#c8a979] " +
  "transition-all duration-150 ease-in-out " +
  "hover:bg-[#d2b089] hover:scale-[1.02] " +
  "active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] " +
  "focus:outline-none";

  const colors = active ? "bg-[#e3c8aa] text-black" : "bg-[#c2a178] text-black";

  return (
    <button className={`${base} ${colors} ${className}`} {...props}>
      {children}
    </button>
  );
}
