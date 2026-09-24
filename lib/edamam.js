const BASE = 'https://api.edamam.com/api/recipes/v2';

const auth = () => ({
  app_id: process.env.EDAMAM_APP_ID,
  app_key: process.env.EDAMAM_APP_KEY,
});

/** @param {{ q?: string; diet?: string; health?: string[]; mealType?: string; calories?: string; cont?: string }} opts */
export async function searchRecipes({ q = '', diet, health = [], mealType, calories, cont }) {
  const params = new URLSearchParams({ type: 'public', ...auth() });
  if (q) params.set('q', q);
  if (diet) params.set('diet', diet);
  if (mealType) params.set('mealType', mealType);
  for (const h of health) params.append('health', h);
  if (calories) params.set('calories', calories);
  if (cont) params.set('_cont', cont);

  const res = await fetch(`${BASE}?${params}`, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Edamam search failed: ${res.status}`);
  const data = await res.json();
  const nextHref = data._links?.next?.href ?? null;
  return {
    hits: data.hits ?? [],
    count: data.count ?? 0,
    cont: nextHref ? new URL(nextHref).searchParams.get('_cont') : null,
  };
}

export async function getRecipe(id) {
  const params = new URLSearchParams({ type: 'public', ...auth() });
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}?${params}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Edamam recipe failed: ${res.status}`);
  const data = await res.json();
  return data.recipe;
}