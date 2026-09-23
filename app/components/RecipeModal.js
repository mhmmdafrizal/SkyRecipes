'use client';
import { useEffect } from 'react';

const RecipeModal = ({ recipe, onClose }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={recipe.label}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recipe.image} alt={recipe.label} className="h-52 w-full object-cover" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md hover:text-slate-900 dark:bg-slate-700/90 dark:text-slate-300 dark:hover:text-slate-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{recipe.label}</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
            {recipe.halal && (
              <span
                className={`rounded-full px-2 py-1 font-medium ${
                  recipe.halal === 'halal'
                    ? 'bg-emerald-100 text-emerald-700'
                    : recipe.halal === 'mushbooh'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                }`}
              >
                {recipe.halal === 'halal' ? 'Halal' : recipe.halal === 'mushbooh' ? 'Check ingredients — doubtful' : 'Not halal'}
              </span>
            )}
            {recipe.calories && <span className="rounded-full bg-sky-100 dark:bg-sky-900/70 px-3 py-1">{Math.round(recipe.calories)} kcal</span>}
            {recipe.totalTime && <span className="rounded-full bg-sky-100 dark:bg-sky-900/70 px-3 py-1">{Math.round(recipe.totalTime)} min</span>}
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-teal-100 px-3 py-1 font-medium text-teal-700 hover:bg-teal-200 dark:bg-teal-900/60 dark:text-teal-300 dark:hover:bg-teal-800"
            >
              View original ↗
            </a>
          </div>

          <h3 className="mt-5 text-sm font-semibold text-slate-800 dark:text-slate-100">Ingredients</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
            {recipe.ingredientLines?.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>

          <h3 className="mt-5 text-sm font-semibold text-slate-800 dark:text-slate-100">Nutrition</h3>
          <div className="mt-2 space-y-2">
            {recipe.digest
              ?.filter((d) => d.daily > 0)
              .slice(0, 6)
              .map((d) => (
                <div key={d.tag}>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{d.label}</span>
                    <span>
                      {Math.round(d.total)} {d.unit} · {Math.round(d.daily)}% DV
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-sky-100 dark:bg-sky-900/70">
                    <div className="h-1.5 rounded-full bg-sky-400" style={{ width: `${Math.min(d.daily, 100)}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;