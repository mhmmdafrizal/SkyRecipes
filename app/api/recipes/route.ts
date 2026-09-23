import { searchRecipes, getRecipe } from '@/lib/edamam';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) return fetchById(id);

  const health: string[] = (url.searchParams.get('health') ?? '').split(',').filter(Boolean);
  const calories = url.searchParams.get('calories') ?? '';

  try {
    const result = await searchRecipes({
      q: url.searchParams.get('q') ?? '',
      diet: url.searchParams.get('diet') ?? '',
      mealType: url.searchParams.get('mealType') ?? '',
      health,
      calories,
      cont: url.searchParams.get('cont') ?? '',
    });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

async function fetchById(id: string) {
  try {
    const recipe = await getRecipe(id);
    return Response.json({ recipe });
  } catch (error) {
    return errorResponse(error);
  }
}

function errorResponse(error: unknown) {
  const status = error instanceof Error && /: (404|401)$/.test(error.message) ? 404 : 502;
  return Response.json({ error: error instanceof Error ? error.message : 'Upstream error' }, { status });
}