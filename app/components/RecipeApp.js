'use client';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import FilterBar from './FilterBar';
import RecipeCard from './RecipeCard';
import RecipeModal from './RecipeModal';
import { halalStatus } from '../../lib/halal.mjs';

const FAV_KEY = 'rg_favorites_v1';
const SNAP_KEY = 'rg_state_v1';
const EMPTY_FILTERS = { diet: '', mealType: '', health: [], calories: '' };

// ponytail: sessionStorage snapshot so back-from-recipe keeps search/filters/results.
// Read per-mount via lazy useState initializers (page is client-only, never SSR'd).
const snap = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SNAP_KEY) || 'null') ?? {};
  } catch {
    return {};
  }
};

const toRecipe = (hit) => {
  const r = hit.recipe;
  return {
    id: r.uri.split('#recipe_')[1],
    label: r.label,
    image: r.image,
    source: r.source,
    url: r.url,
    calories: r.calories,
    totalTime: r.totalTime,
    ingredientLines: r.ingredientLines,
    digest: r.digest,
    halal: halalStatus(`${r.label} ${(r.ingredientLines || []).join(' ')}`),
  };
};

const loadFavs = () => {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch {
    return [];
  }
};

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 dark:bg-slate-800/80 dark:ring-slate-700">
    <div className="h-44 animate-pulse rounded-xl bg-sky-100 dark:bg-slate-700" />
    <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-sky-100 dark:bg-slate-700" />
    <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-sky-50 dark:bg-slate-700/60" />
  </div>
);

const RecipeApp = () => {
  const [search, setSearch] = useState(() => snap().search ?? '');
  const [filters, setFilters] = useState(() => snap().filters ?? EMPTY_FILTERS);
  const [recipes, setRecipes] = useState(() => snap().recipes ?? []);
  const [cont, setCont] = useState(() => snap().cont ?? null);
  const [count, setCount] = useState(() => snap().count ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('all');
  const [favorites, setFavorites] = useState(loadFavs);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    sessionStorage.setItem(SNAP_KEY, JSON.stringify({ search, filters, recipes, count, cont }));
  }, [search, filters, recipes, count, cont]);

  const runSearch = async (nextCont = null, filterPatch = null, q = search) => {
    const eff = { ...filters, ...(filterPatch || {}) };
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams({ q });
      if (eff.diet) p.set('diet', eff.diet);
      if (eff.mealType) p.set('mealType', eff.mealType);
      // ponytail: Edamam has no halal label (health=halal -> 400), filter client-side instead
      const health = eff.health.filter((h) => h !== 'halal');
      if (health.length) p.set('health', health.join(','));
      if (eff.calories) p.set('calories', `0-${eff.calories}`);
      if (nextCont) p.set('cont', nextCont);

      const res = await fetch(`/api/recipes?${p.toString()}`);
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();

      const hits = data.hits
        .map(toRecipe)
        .filter((r) => !eff.health.includes('halal') || r.halal !== 'haram');
      setCont(data.cont);
      setCount(data.count);
      setRecipes((prev) => (nextCont ? [...prev, ...hits] : hits));
      setView('all');
    } catch {
      setError('Could not fetch recipes. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (next) => {
    setFilters(next);
    runSearch(null, next, search);
  };

  const toggleFavorite = (recipe) => {
    setFavorites((prev) =>
      prev.some((f) => f.id === recipe.id) ? prev.filter((f) => f.id !== recipe.id) : [...prev, recipe]
    );
  };

  const gridItems = view === 'favs' ? favorites : recipes;
  const gridVisible =
    gridItems.length > 0 || (view === 'all' && recipes.length > 0 && loading);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 select-none">
      <Navbar />

      <section className="py-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl dark:text-slate-100">
          What are you <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">cooking</span> today?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-500 dark:text-slate-400">
          Search thousands of recipes, filter by diet and health labels, and save the ones you love.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          placeholder="Try ‘chicken’, ‘pasta’, ‘salad’…"
          className="flex-1 rounded-2xl border border-sky-200 bg-white/80 px-4 py-3 text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-sky-800 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-slate-500"
        />
        <button
          onClick={() => runSearch()}
          disabled={loading}
          className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white shadow-md shadow-sky-500/30 transition hover:bg-sky-600 disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      <div className="mt-4">
        <FilterBar value={filters} onApply={applyFilters} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setView('all')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              view === 'all' ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30' : 'bg-sky-50 text-slate-600 hover:bg-sky-100 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            All results{count ? ` (${count})` : ''}
          </button>
          <button
            onClick={() => setView('favs')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              view === 'favs' ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30' : 'bg-rose-50 text-slate-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-slate-300 dark:hover:bg-rose-900/50'
            }`}
          >
            Saved ({favorites.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/70 dark:text-rose-300">
          {error}
          <button onClick={() => runSearch()} className="ml-3 font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {view === 'favs' && favorites.length === 0 && !loading && (
        <p className="mt-16 text-center text-slate-500 dark:text-slate-400">
          Nothing saved yet. Tap the heart on any recipe to keep it here.
        </p>
      )}

      {view === 'all' && loading && recipes.length === 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {view === 'all' && !loading && !error && recipes.length === 0 && (
        <p className="mt-16 text-center text-slate-500 dark:text-slate-400">
          No recipes yet. Search above to get started — try leaving filters empty for more results.
        </p>
      )}

      {gridVisible && (
        <>
          <div
            className={`mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ${
              loading && view === 'all' && recipes.length > 0 ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            {gridItems.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                isFav={favorites.some((f) => f.id === r.id)}
                onToggleFav={toggleFavorite}
                onView={setSelected}
              />
            ))}
          </div>

          {view === 'all' && cont && (
            <div className="mt-8 text-center">
              <button
                onClick={() => runSearch(cont)}
                disabled={loading}
                className="rounded-2xl border border-sky-300 bg-white/80 px-6 py-2.5 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50 disabled:opacity-50 dark:border-sky-700 dark:bg-slate-800/80 dark:text-sky-300 dark:hover:bg-slate-700"
              >
                {loading ? 'Loading…' : 'Load more recipes'}
              </button>
            </div>
          )}
        </>
      )}

      <RecipeModal recipe={selected} onClose={() => setSelected(null)} />
    </main>
  );
};

export default RecipeApp;