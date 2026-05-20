import React from 'react';

export function Card({ darkMode, children, className = '', hover = true, ...props }) {
  const base = darkMode
    ? 'bg-[var(--surface)] border-[var(--border)] text-white'
    : 'bg-[var(--surface)] border-[var(--border)] text-gray-900';
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const hoverCls =
    hover && !reducedMotion
      ? 'motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-2xl'
      : '';

  return (
    <div
      className={`rounded-2xl p-6 border shadow-xl ${base} ${hoverCls} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
