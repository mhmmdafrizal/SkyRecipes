// ponytail: keyword classification over ingredients, not certification data.
// Upgrade path: swap halalStatus() for a Zabihah/HalalLens API call when a key exists.
const HARAM =
  /\b(pork|bacon|ham|lard|prosciutto|pancetta|chorizo|salami|(?<!rice )wine|beer|whisk(?:ey|y)|vodka|rum|brandy|liquor|gin|cognac|champagne)\b/i;
const MUSHBOOH =
  /\b(gelatin|rennet|vanilla extract|shortening|emulsifier|mono-? and diglycerides|sake|sherry|mirin|shaoxing)\b|\be?47[014]\b/i;
const MEAT = /\b(chicken|beef|lamb|mutton|turkey|duck|steak|mince|meatball|sausage|meat)\b/i;

/** @returns {'halal' | 'mushbooh' | 'haram'} */
export function halalStatus(text = '') {
  if (HARAM.test(text)) return 'haram';
  if (MUSHBOOH.test(text) || MEAT.test(text)) return 'mushbooh';
  return 'halal';
}

export const HALAL_LABEL = { halal: 'Halal', mushbooh: 'Check', haram: 'Not halal' };

// Self-check: node lib/halal.mjs
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('halal.mjs')) {
  const eq = (got, want, name) => {
    if (got !== want) throw new Error(`${name}: expected ${want}, got ${got}`);
  };
  eq(halalStatus('1 cup flour, 2 eggs, olive oil, spinach'), 'halal', 'vegetarian');
  eq(halalStatus('2 chicken thighs with rice'), 'mushbooh', 'meat');
  eq(halalStatus('pork chops simmered in red wine'), 'haram', 'pork + wine');
  eq(halalStatus('6 gelatin sheets, sugar, water'), 'mushbooh', 'gelatin');
  eq(halalStatus('butter, milk, flour'), 'halal', 'dairy');
  eq(halalStatus('2 tablespoons sake, mirin'), 'mushbooh', 'cooking wine = doubtful, not forbidden');
  eq(halalStatus('1 cup Shaoxing rice wine'), 'mushbooh', 'rice wine = cooking alcohol');
  eq(halalStatus('hamburger bun, sesame seeds'), 'halal', 'no false ham match');
  console.log('halal.mjs self-check OK');
}
