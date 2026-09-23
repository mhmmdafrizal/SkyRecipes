'use client';
import { useState } from 'react';

const DIETS = ['balanced', 'high-protein', 'low-carb', 'low-fat', 'low-sodium'];
const HEALTH = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'sugar-conscious', 'peanut-free', 'halal'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Teatime'];

const selectCls =
  'rounded-xl border border-sky-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-sky-800 dark:bg-slate-800/80 dark:text-slate-200';

const FilterBar = ({ value, onApply }) => {
  const [draft, setDraft] = useState(value);

  const patch = (p) => setDraft((d) => ({ ...d, ...p }));
  const toggleHealth = (h) =>
    setDraft((d) => ({
      ...d,
      health: d.health.includes(h) ? d.health.filter((x) => x !== h) : [...d.health, h],
    }));

  const clear = () => {
    const empty = { diet: '', mealType: '', health: [], calories: '' };
    setDraft(empty);
    onApply(empty);
  };

  return (
    <div className="rounded-2xl border border-sky-100 bg-white/70 p-4 shadow-sm backdrop-blur select-none dark:border-slate-700 dark:bg-slate-800/70">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Diet
          <select className={selectCls} value={draft.diet} onChange={(e) => patch({ diet: e.target.value })}>
            <option value="">Any</option>
            {DIETS.map((d) => (
              <option key={d} value={d}>
                {d.replace('-', ' ')}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Meal type
          <select className={selectCls} value={draft.mealType} onChange={(e) => patch({ mealType: e.target.value })}>
            <option value="">Any</option>
            {MEALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Max calories (kcal)
          <input
            type="number"
            min="0"
            placeholder="e.g. 600"
            className={selectCls}
            value={draft.calories}
            onChange={(e) => patch({ calories: e.target.value })}
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onApply(draft)}
            className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/30 transition hover:bg-sky-600"
          >
            Apply filters
          </button>
          <button
            onClick={clear}
            className="rounded-xl border border-sky-200 px-3 py-2 text-sm text-slate-500 hover:bg-sky-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Health labels:</span>
        {HEALTH.map((h) => {
          const active = draft.health.includes(h);
          return (
            <button
              key={h}
              onClick={() => toggleHealth(h)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'bg-sky-50 text-slate-600 hover:bg-sky-100 dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {h.replace('-', ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBar;