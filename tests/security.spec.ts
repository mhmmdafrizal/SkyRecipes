import { test, expect } from '@playwright/test';
import { mockSearch, loadEnv } from './fixtures';

test.describe('security', () => {
  test('search input is XSS-safe', async ({ page }) => {
    const payload = '<img src=x onerror="window.__pwned=1">';
    let dialog = false;
    page.on('dialog', () => {
      dialog = true;
    });

    await mockSearch(page);
    await page.goto('/');
    await page.getByPlaceholder(/chicken|pasta|salad/).fill(payload);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Crispy Chicken Rice' })).toBeVisible();

    expect(dialog).toBe(false);
    expect(await page.evaluate(() => (window as Window & { __pwned?: unknown }).__pwned)).toBeUndefined();
    expect(await page.locator('img[src="x"]').count()).toBe(0);
  });

  test('recipe label HTML is escaped', async ({ page }) => {
    const payload = '<script>window.__pwned=1</script>';
    await page.route('**/api/recipes**', (route) =>
      route.fulfill({
        json: {
          hits: [
            {
              recipe: {
                uri: 'https://api.edamam.com/api/recipes/v2#recipe_xss1',
                label: payload,
                image: 'https://img.mocked/xss1.jpg',
                source: 'X',
                url: 'https://x.example',
                calories: 5,
                totalTime: 1,
                ingredientLines: ['<b>bold</b>'],
                digest: [],
              },
            },
          ],
          count: 1,
          cont: null,
        },
      })
    );

    await page.goto('/');
    await page.getByPlaceholder(/chicken|pasta|salad/).fill('x');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    await expect(page.getByRole('heading', { name: payload })).toBeVisible();
    expect(await page.evaluate(() => (window as Window & { __pwned?: unknown }).__pwned)).toBeUndefined();
    expect(await page.locator('script', { hasText: '__pwned' }).count()).toBe(0);
  });

  test('favorites from localStorage are escaped', async ({ page }) => {
    const payload = '<img src=x onerror="window.__pwned=1">';
    await page.addInitScript(
      (p) => {
        localStorage.setItem(
          'rg_favorites_v1',
          JSON.stringify([{ id: 'evil', label: p, image: 'https://img.mocked/evil.jpg', calories: 1, totalTime: 1 }])
        );
      },
      payload
    );

    await page.goto('/');
    await page.getByRole('button', { name: /Saved \(1\)/ }).click();
    await expect(page.getByRole('heading', { name: payload })).toBeVisible();
    expect(await page.evaluate(() => (window as Window & { __pwned?: unknown }).__pwned)).toBeUndefined();
    expect(await page.locator('img[src="x"]').count()).toBe(0);
  });

  test('no API credentials leak into client payloads', async ({ page }) => {
    const env = loadEnv();
    test.skip(!env.EDAMAM_APP_ID || !env.EDAMAM_APP_KEY, 'EDAMAM credentials not found in .env.local');

    const bodies: string[] = [];
    page.on('response', async (res) => {
      const ct = res.headers()['content-type'] ?? '';
      if (new URL(res.url()).pathname === '/' || ct.includes('javascript')) {
        try {
          bodies.push(await res.text());
        } catch {
          /* body already consumed */
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(bodies.length).toBeGreaterThan(0);
    for (const body of bodies) {
      expect(body).not.toContain(env.EDAMAM_APP_ID);
      expect(body).not.toContain(env.EDAMAM_APP_KEY);
    }
  });

  test('security headers are set on responses', async ({ request }) => {
    const res = await request.get('/');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['x-frame-options']).toBe('DENY');
    expect(res.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });
});