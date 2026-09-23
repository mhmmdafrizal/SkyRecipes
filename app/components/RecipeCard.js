/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

const BADGE = {
  halal: 'bg-emerald-500/95 text-white',
  mushbooh: 'bg-amber-400/95 text-amber-950',
  haram: 'bg-rose-500/95 text-white',
};

const RecipeCard = ({ recipe, isFav, onToggleFav, onView }) => {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white/80 shadow-sm shadow-sky-900/5 ring-1 ring-sky-100 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/10 dark:bg-slate-800/80 dark:ring-slate-700">
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.label}
          className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <button
          onClick={() => onToggleFav(recipe)}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition ${
            isFav ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-400 hover:text-rose-500 dark:bg-slate-700/90 dark:text-slate-300'
          }`}
        >
          <svg viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path
              d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {recipe.halal && (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-sm ${
              BADGE[recipe.halal]
            }`}
          >
            {recipe.halal === 'halal' ? 'Halal' : recipe.halal === 'mushbooh' ? 'Check' : 'Not halal'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{recipe.label}</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {recipe.calories ? `${Math.round(recipe.calories)} kcal` : recipe.source}
          {recipe.totalTime ? ` · ${Math.round(recipe.totalTime)} min` : ''}
        </p>

        <div className="mt-3 flex items-center gap-2 pt-2">
          <Link
            href={`/recipe/${recipe.id}`}
            className="flex-1 rounded-xl bg-sky-100 px-3 py-2 text-center text-xs font-semibold text-sky-700 transition hover:bg-sky-200 dark:bg-sky-900/60 dark:text-sky-300 dark:hover:bg-sky-800"
          >
            View recipe
          </Link>
          <button
            onClick={() => onView(recipe)}
            className="flex-1 rounded-xl border border-sky-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Ingredients
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;