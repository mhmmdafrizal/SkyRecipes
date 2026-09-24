import { test, expect } from '@playwright/test';
import { mockSearch } from './fixtures';

const input = (page: Parameters<typeof mockSearch>[0]) =>
  page.getByPlaceholder(/chicken|pasta|salad/);

const search = async (page: Parameters<typeof mockSearch>[0], q = 'chicken') => {
  await input(page).fill(q);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
};

test.describe('home app', () => {
  test('search renders recipe cards with count', async ({ page }) => {
    await mockSearch(page);
    await page.goto('/');
    await search(page);

    await expect(page.getByRole('heading', { name: 'Crispy Chicken Rice' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Garden Salad' })).toBeVisible();
    await expect(page.getByRole('button', { name: /All results \(3\)/ })).toBeVisible();
  });

  test('halal filter hides haram recipes', async ({ page }) => {
    await mockSearch(page);
    await page.goto('/');
    await search(page);

    await expect(page.getByText('Not halal')).toBeVisible();
    await page.getByRole('button', { name: /^halal$/ }).click();
    await page.getByRole('button', { name: 'Apply filters' }).click();

    await expect(page.getByText('Not halal')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Pork Belly Bites' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Crispy Chicken Rice' })).toBeVisible();
  });

  test('load more appends results', async ({ page }) => {
    await mockSearch(page);
    await page.goto('/');
    await search(page);

    await page.getByRole('button', { name: 'Load more recipes' }).click();
    await expect(page.getByRole('heading', { name: 'Lentil Soup' })).toBeVisible();
  });

  test('favorites persist across reload', async ({ page }) => {
    await mockSearch(page);
    await page.goto('/');
    await search(page);

    await page.getByRole('button', { name: 'Add to favorites' }).first().click();
    await expect(page.getByRole('button', { name: /Saved \(1\)/ })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: /Saved \(1\)/ })).toBeVisible();
    await page.getByRole('button', { name: /Saved \(1\)/ }).click();
    await expect(page.getByRole('heading', { name: 'Crispy Chicken Rice' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible();
  });

  test('ingredients modal opens and closes', async ({ page }) => {
    await mockSearch(page);
    await page.goto('/');
    await search(page);

    await page.getByRole('button', { name: 'Ingredients' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('2 chicken thighs');

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('search state restored after visiting a recipe', async ({ page }) => {
    await mockSearch(page);
    await page.goto('/');
    await search(page);

    await page.getByRole('link', { name: 'View recipe' }).first().click();
    await expect(page).toHaveURL(/recipe\/mock1/);
    // Mocked id 404s server-side, but sessionStorage survives the round-trip in this tab.
    await page.goto('/');

    await expect(input(page)).toHaveValue('chicken');
    await expect(page.getByRole('heading', { name: 'Crispy Chicken Rice' })).toBeVisible();
  });

  test('theme toggle persists across reload', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    await page.getByRole('button', { name: /Switch to/ }).click();
    await expect(html).toHaveClass(/dark/);
    await expect(page.evaluate(() => localStorage.getItem('rg_theme'))).resolves.toBe('dark');

    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });

  test('search error shows message and Retry works', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/recipes**', async (route) => {
      calls++;
      if (calls === 1) return route.fulfill({ status: 502, json: { error: 'Upstream error' } });
      await route.fulfill({
        json: {
          hits: [
            {
              recipe: {
                uri: 'https://api.edamam.com/api/recipes/v2#recipe_mock1',
                label: 'Crispy Chicken Rice',
                image: 'https://img.mocked/mock1.jpg',
                source: 'Mock Source',
                url: 'https://edamam.example/recipe/mock1',
                calories: 420,
                totalTime: 40,
                ingredientLines: ['2 chicken thighs'],
                digest: [],
              },
            },
          ],
          count: 1,
          cont: null,
        },
      });
    });

    await page.goto('/');
    await search(page);

    await expect(page.getByText(/Could not fetch recipes/)).toBeVisible();
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('heading', { name: 'Crispy Chicken Rice' })).toBeVisible();
  });
});