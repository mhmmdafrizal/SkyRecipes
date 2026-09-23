/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipe } from '@/lib/edamam';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const recipe = await getRecipe(id);
    return { title: recipe.label, description: `${recipe.source} · ${Math.round(recipe.calories)} kcal` };
  } catch {
    return { title: 'Recipe' };
  }
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let recipe;
  try {
    recipe = await getRecipe(id);
  } catch {
    notFound();
  }

  const time = recipe.totalTime ? `${Math.round(recipe.totalTime)} min` : recipe.source;
  const servings = recipe.yield ? `${Math.round(recipe.yield)} servings` : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 select-none">
      <Link href="/" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
        &larr; Back to search
      </Link>

      <article className="mt-4 overflow-hidden rounded-3xl bg-white/80 shadow-lg shadow-sky-900/5 backdrop-blur dark:bg-slate-800/85">
        <img
          src={recipe.image}
          alt={recipe.label}
          className="h-72 w-full object-cover"
        />
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{recipe.label}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="rounded-full bg-sky-100 dark:bg-sky-900/70 px-3 py-1">{Math.round(recipe.calories)} kcal</span>
            <span className="rounded-full bg-sky-100 dark:bg-sky-900/70 px-3 py-1">{time}</span>
            {servings && <span className="rounded-full bg-sky-100 dark:bg-sky-900/70 px-3 py-1">{servings}</span>}
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-teal-100 px-3 py-1 font-medium text-teal-700 hover:bg-teal-200 dark:bg-teal-900/60 dark:text-teal-300 dark:hover:bg-teal-800"
            >
              View original recipe ↗
            </a>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <section>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Ingredients</h2>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                {recipe.ingredientLines.map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Nutrition</h2>
              <div className="mt-3 space-y-3">
                {recipe.digest
                  ?.filter((d: { daily: number }) => d.daily > 0)
                  .slice(0, 8)
                  .map((d: { tag: string; label: string; total: number; unit: string; daily: number }) => (
                    <div key={d.tag}>
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{d.label}</span>
                        <span>
                          {Math.round(d.total)} {d.unit} · {Math.round(d.daily)}% DV
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-sky-100 dark:bg-sky-900/70">
                        <div
                          className="h-2 rounded-full bg-sky-400"
                          style={{ width: `${Math.min(d.daily, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}