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
    "px-4 py-2 text-base font-semibold min-w-[70px] text-center cursor-pointer " +
    "rounded-lg border-[1.5px] border-black " +
    "shadow-[0_4px_10px_rgba(0,0,0,0.5)] " +
    "transition-transform duration-200 ease-in-out " +
    "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black/70 focus:ring-offset-2 focus:ring-offset-[#ead0aa]";

  const colors = active ? "bg-[#e3c8aa] text-black" : "bg-[#c2a178] text-black";

  return (
    <button className={`${base} ${colors} ${className}`} {...props}>
      {children}
    </button>
  );
}
