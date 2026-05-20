import React from 'react';

const variants = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
  secondary: 'bg-[var(--surface-muted)] hover:opacity-90 text-[var(--text)] border border-[var(--border)]',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-[var(--surface-muted)] text-[var(--text-muted)]',
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled,
  icon: Icon,
  ...props
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed motion-safe:hover:scale-[1.02] ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} aria-hidden />}
      {loading ? 'Saving…' : children}
    </button>
  );
}
