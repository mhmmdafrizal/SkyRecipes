import fs from 'node:fs';
import type { Page } from '@playwright/test';

const hit = (id: string, label: string, ingredients: string[], calories = 300, totalTime = 30) => ({
  recipe: {
    uri: `https://api.edamam.com/api/recipes/v2#recipe_${id}`,
    label,
    image: `https://img.mocked/${id}.jpg`,
    source: 'Mock Source',
    url: `https://edamam.example/recipe/${id}`,
    calories,
    totalTime,
    ingredientLines: ingredients,
    digest: [],
  },
});

const BASE = {
  hits: [
    hit('mock1', 'Crispy Chicken Rice', ['2 chicken thighs', 'jasmine rice'], 420, 40),
    hit('mock2', 'Garden Salad', ['spinach', 'tomato', 'olive oil'], 150, 10),
    hit('mock3', 'Pork Belly Bites', ['pork belly', 'salt'], 800, 60),
  ],
  count: 3,
  cont: 'mock-cont',
};

const MORE = {
  hits: [hit('mock4', 'Lentil Soup', ['red lentils', 'onion'], 250, 25)],
  count: 4,
  cont: null,
};

/** Intercept /api/recipes so every home-app test is deterministic (no real Edamam calls). */
export async function mockSearch(page: Page) {
  await page.route('**/api/recipes**', async (route) => {
    const url = new URL(route.request().url());
    const body = url.searchParams.get('cont') ? MORE : BASE;
    await route.fulfill({ json: body });
  });
}

/** Read .env.local without adding a dotenv dependency. */
export function loadEnv(): Record<string, string> {
  try {
    const txt = fs.readFileSync('.env.local', 'utf8');
    return Object.fromEntries(
      txt
        .split(/\r?\n/)
        .filter((l) => l && !l.startsWith('#'))
        .map((l) => {
          const i = l.indexOf('=');
          return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
        })
    );
  } catch {
    return {};
  }
}