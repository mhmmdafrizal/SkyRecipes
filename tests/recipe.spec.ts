import { test, expect } from '@playwright/test';
import { loadEnv } from './fixtures';

test('invalid recipe id renders the 404 page', async ({ page }) => {
  await page.goto('/recipe/definitely-not-a-real-recipe-id');
  await expect(page.getByText('This page could not be found')).toBeVisible();
});

test('real recipe page renders', async ({ page }) => {
  const env = loadEnv();
  test.skip(!env.EDAMAM_APP_ID || !env.EDAMAM_APP_KEY, 'EDAMAM credentials not found in .env.local — opt-in via @real-api');

  const url = new URL('https://api.edamam.com/api/recipes/v2');
  url.searchParams.set('type', 'public');
  url.searchParams.set('app_id', env.EDAMAM_APP_ID);
  url.searchParams.set('app_key', env.EDAMAM_APP_KEY);
  url.searchParams.set('q', 'chicken');

  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const data = await res.json();
  const hit = data.hits?.[0];
  test.skip(!hit, 'no recipe returned by Edamam');

  await page.goto(`/recipe/${hit.recipe.uri.split('#recipe_')[1]}`);
  await expect(page.getByRole('heading', { name: hit.recipe.label })).toBeVisible();
  await expect(page.getByText('Ingredients')).toBeVisible();
});