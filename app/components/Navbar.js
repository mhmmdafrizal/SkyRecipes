'use client';
import { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('rg_theme', next ? 'dark' : 'light');
    setDark(next);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/70 backdrop-blur select-none dark:border-slate-700 dark:bg-slate-900/70">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">SkyRecipes</span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:block dark:text-slate-400"></span>
          <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-white/80 text-slate-600 shadow-sm transition hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {dark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
