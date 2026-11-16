import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Typical Kenyan market & duka prices in KSh.
 * IMPORTANT: This price list should be updated regularly to reflect current local market rates.
 */
export const PRICES: Record<string, { item: string; unit: string; price: number }> = {
  // Vegetables & Greens
  sukumaWiki: { item: 'Sukuma wiki (kale)', unit: '1 bunch', price: 20 },
  spinach: { item: 'Spinach', unit: '1 bunch', price: 30 },
  cabbage: { item: 'Cabbage', unit: '1 small head', price: 50 },
  tomatoes: { item: 'Tomatoes (nyanya)', unit: '1 kg', price: 100 },
  carrots: { item: 'Carrots', unit: '1 kg', price: 100 },
  potatoes: { item: 'Potatoes (waru)', unit: '1 kg', price: 100 },
  sweetPotatoes: { item: 'Sweet potatoes (ngwaci)', unit: '1 kg', price: 100 },
  peas: { item: 'Green peas (minji)', unit: '1/2 kg', price: 120 },
  greenPeppers: { item: 'Green pepper (hoho)', unit: '1 piece', price: 15 },
  managu: { item: 'Managu', unit: '1 bunch', price: 40 },
  terere: { item: 'Terere (amaranth)', unit: '1 bunch', price: 30 },
  pumpkin: { item: 'Pumpkin (malenge)', unit: '1 kg', price: 80 },
  dhania: { item: 'Coriander (dhania)', unit: '1 bunch', price: 10 },
  garlic: { item: 'Garlic (kitunguu saumu)', unit: '1 bulb', price: 30 },
  ginger: { item: 'Ginger (tangawizi)', unit: '1 piece', price: 20 },

  // Proteins
  eggs: { item: 'Eggs (mayai)', unit: '1 piece', price: 18 },
  beef: { item: 'Beef (nyama)', unit: '1 kg', price: 700 },
  mincedMeat: { item: 'Minced meat', unit: '1 kg', price: 750 },
  chicken: { item: 'Chicken (kuku)', unit: '1 kg', price: 600 },
  goatMeat: { item: 'Goat meat (mbuzi)', unit: '1 kg', price: 800 },
  fishTilapia: { item: 'Tilapia fish (samaki)', unit: '1 medium whole fish', price: 350 },
  omena: { item: 'Omena (dried sardines)', unit: '500 g (1 gorogoro tin)', price: 180 },
  sausages: { item: 'Sausages / smokies', unit: '1 piece', price: 50 },
  beans: { item: 'Beans (maharagwe)', unit: '1 kg', price: 200 },
  ndengu: { item: 'Ndengu (green grams)', unit: '1 kg', price: 220 },
  njahi: { item: 'Njahi (black beans)', unit: '1 kg', price: 240 },
  kamande: { item: 'Kamande (lentils)', unit: '1 kg', price: 240 },

  // Grains & Flour
  rice: { item: 'Rice (mchele)', unit: '1 kg', price: 200 },
  maizeFlour: { item: 'Maize flour (unga wa ugali)', unit: '2 kg', price: 170 },
  wheatFlour: { item: 'Wheat flour', unit: '2 kg', price: 190 },
  chapatiFlour: { item: 'Chapati flour (atta)', unit: '2 kg', price: 210 },
  githeri: { item: 'Pre-boiled githeri (maize & beans)', unit: '1 kg', price: 150 },
  muthokoi: { item: 'Muthokoi (dehulled maize)', unit: '1 kg', price: 160 },
  spaghetti: { item: 'Spaghetti / pasta', unit: '400 g packet', price: 110 },
  bread: { item: 'Bread (mkate)', unit: '400 g loaf', price: 65 },

  // Fruit, Dairy & Roots
  matoke: { item: 'Green bananas (matoke)', unit: '1 bunch (approx. 6 pieces)', price: 100 },
  avocado: { item: 'Avocado (parachichi)', unit: '1 piece', price: 30 },
  coconutMilk: { item: 'Coconut milk (tui la nazi)', unit: '250 ml', price: 80 },
  milk: { item: 'Milk (maziwa)', unit: '500 ml packet', price: 65 },
  lemon: { item: 'Lemon (ndimu)', unit: '1 piece', price: 15 },
  arrowRoots: { item: 'Arrow roots (nduma)', unit: '1 kg', price: 150 },
  cassava: { item: 'Cassava (muhogo)', unit: '1 kg', price: 100 },
};

function formatPriceListForPrompt(): string {
  return Object.values(PRICES)
    .map((p) => `- ${p.item}: KSh ${p.price} per ${p.unit}`)
    .join('\n');
}

interface RecipeRequest {
  ingredients: string[];
  budgetKsh?: number | null;
  timeLimit?: string;
  servings?: number;
  cookingSetup?: string;
  useExpiringSoon?: boolean;
}

interface ShoppingListItem {
  item: string;
  quantity: string;
  price: number;
  isApproximate?: boolean;
}

interface MealSuggestion {
  name: string;
  localName: string;
  description: string;
  timeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium';
  ingredientsUserHas: string[];
  ingredientsMissing: string[];
  ingredients: string[];
  steps: string[];
  tip: string;
  estimatedCost: number;
  shoppingList: ShoppingListItem[];
}

function normalizeAndVerifyMeal(
  rawMeal: any,
  userIngredients: string[],
  defaultServings: number
): MealSuggestion {
  const shoppingList: ShoppingListItem[] = Array.isArray(rawMeal?.shoppingList)
    ? rawMeal.shoppingList
        .filter((entry: any) => entry && typeof entry.item === 'string' && entry.item.trim())
        .map((entry: any) => ({
          item: String(entry.item).trim(),
          quantity: String(entry.quantity || '1 portion').trim(),
          price: Math.max(0, Math.round(Number(entry.price) || 0)),
          isApproximate: Boolean(entry.isApproximate),
        }))
    : [];

  // Recompute total in code so arithmetic is always exact
  const computedTotal = shoppingList.reduce((sum, entry) => sum + entry.price, 0);
  const estimatedCost =
    shoppingList.length > 0
      ? computedTotal
      : Math.max(0, Math.round(Number(rawMeal?.estimatedCost) || 0));

  const ingredientsUserHas: string[] = Array.isArray(rawMeal?.ingredientsUserHas)
    ? rawMeal.ingredientsUserHas.map((s: any) => String(s))
    : [];

  const ingredientsMissing: string[] =
    shoppingList.length > 0
      ? shoppingList.map((s) => `${s.item} (${s.quantity})`)
      : Array.isArray(rawMeal?.ingredientsMissing)
        ? rawMeal.ingredientsMissing.map((s: any) => String(s))
        : [];

  return {
    name: String(rawMeal?.name || 'Kenyan Home Dish'),
    localName: String(rawMeal?.localName || 'Chakula Kitamu'),
    description: String(rawMeal?.description || 'Simple, wholesome Kenyan home cooking.'),
    timeMinutes: Math.max(5, Math.round(Number(rawMeal?.timeMinutes) || 30)),
    servings: Math.max(1, Math.round(Number(rawMeal?.servings) || defaultServings)),
    difficulty: rawMeal?.difficulty === 'Medium' ? 'Medium' : 'Easy',
    ingredientsUserHas: userIngredients.length === 0 ? [] : ingredientsUserHas,
    ingredientsMissing,
    ingredients: Array.isArray(rawMeal?.ingredients)
      ? rawMeal.ingredients.map((s: any) => String(s))
      : [],
    steps: Array.isArray(rawMeal?.steps)
      ? rawMeal.steps.map((s: any) => String(s))
      : [],
    tip: String(rawMeal?.tip || 'Cook on medium-low heat to keep food tender and flavorful.'),
    estimatedCost,
    shoppingList,
  };
}

// Helper to build a realistic fallback shopping item respecting what the user already has
function filterOutUserItems(
  items: ShoppingListItem[],
  userIngredients: string[]
): ShoppingListItem[] {
  if (userIngredients.length === 0) return items;
  const lowerUser = userIngredients.map((i) => i.toLowerCase());
  return items.filter((entry) => {
    const itemLower = entry.item.toLowerCase();
    return !lowerUser.some(
      (u) =>
        itemLower.includes(u.split('(')[0].trim()) ||
        u.includes(itemLower.split('(')[0].trim())
    );
  });
}

// Fallback generator supporting Budget-only, Ingredients-only, and Combined modes
function generateFallbackKenyanMeals(req: RecipeRequest): {
  meals: MealSuggestion[];
  budgetTooLow?: boolean;
  suggestedMinBudget?: number;
  lowestCostMeal?: MealSuggestion;
  friendlyBudgetMessage?: string;
} {
  const userIngredients = Array.isArray(req.ingredients) ? req.ingredients : [];
  const lowerUser = userIngredients.map((i) => i.toLowerCase());
  const servings = Math.max(1, Number(req.servings) || 4);
  const hasBudget = typeof req.budgetKsh === 'number' && req.budgetKsh > 0;
  const budgetKsh = hasBudget ? Math.round(req.budgetKsh as number) : null;

  const has = (key: string) => lowerUser.some((i) => i.includes(key));
  const scaleFactor = Math.max(0.5, servings / 4);

  const candidates: MealSuggestion[] = [];

  // Candidate A: Budget-friendly classic Ugali & Sukuma Wiki (+ optional Eggs)
  {
    const flourQty = servings <= 2 ? '1/2 kg' : '1 kg';
    const flourPrice = servings <= 2 ? 45 : 85;
    const greensBunches = servings <= 2 ? 1 : 2;
    const greensPrice = greensBunches * PRICES.sukumaWiki.price;
    const tomatoPrice = servings <= 2 ? 25 : 40;
    const tomatoQty = servings <= 2 ? '1/4 kg (3 tomatoes)' : '400 g (4 tomatoes)';

    const rawShop = filterOutUserItems(
      [
        { item: 'Maize flour (unga wa ugali)', quantity: flourQty, price: flourPrice },
        { item: 'Sukuma wiki', quantity: `${greensBunches} bunch${greensBunches > 1 ? 'es' : ''}`, price: greensPrice },
        { item: 'Tomatoes', quantity: tomatoQty, price: tomatoPrice },
      ],
      userIngredients
    );

    const totalCost = rawShop.reduce((s, x) => s + x.price, 0);
    candidates.push({
      name: 'Ugali & Sautéed Sukuma Wiki',
      localName: 'Ugali na Sukuma Wiki',
      description: 'Filling, budget-smart Kenyan staple with tender sautéed kale in tomato base.',
      timeMinutes: 20,
      servings,
      difficulty: 'Easy',
      ingredientsUserHas: userIngredients.filter((i) =>
        /maize|ugali|sukuma|kale|tomato/i.test(i)
      ),
      ingredientsMissing: rawShop.map((s) => `${s.item} (${s.quantity})`),
      ingredients: [
        `${flourQty} Maize flour (unga wa ugali)`,
        `${greensBunches} bunch${greensBunches > 1 ? 'es' : ''} Sukuma wiki, finely shredded`,
        `${tomatoQty} Tomatoes, chopped`,
        '1 medium Onion, sliced (from home)',
        '2 tbsp Cooking oil & salt to taste (from home)',
        `${Math.ceil(3 * scaleFactor)} cups Water (from home)`,
      ],
      steps: [
        'Heat cooking oil in a sufuria and fry onions until soft and fragrant.',
        'Add chopped tomatoes and salt, cooking down until soft and saucy.',
        'Toss in shredded sukuma wiki, stir for 4–5 minutes until tender yet bright green, then cover off heat.',
        'In a clean sufuria, bring water to a rapid boil. Add maize flour steadily while stirring with a wooden mwiko until firm and smooth (8–10 minutes).',
        'Shape ugali onto a plate and serve hot alongside the sukuma wiki.',
      ],
      tip: 'Shred sukuma wiki thinly so it cooks faster and goes further across every plate.',
      estimatedCost: totalCost,
      shoppingList: rawShop,
    });
  }

  // Candidate B: Fried Cabbage & Eggs with Ugali or Bread
  {
    const eggCount = Math.min(6, Math.max(2, servings));
    const eggPrice = eggCount * PRICES.eggs.price;
    const rawShop = filterOutUserItems(
      [
        { item: 'Cabbage', quantity: '1 small head', price: PRICES.cabbage.price },
        { item: 'Eggs', quantity: `${eggCount} pieces`, price: eggPrice },
        { item: 'Tomatoes', quantity: '1/4 kg', price: 25 },
      ],
      userIngredients
    );
    const totalCost = rawShop.reduce((s, x) => s + x.price, 0);
    candidates.push({
      name: 'Fried Cabbage & Scrambled Eggs',
      localName: 'Kabeji na Mayai',
      description: 'Quick one-sufuria stir-fry of sweet crunchy cabbage folded with protein-rich eggs.',
      timeMinutes: 15,
      servings,
      difficulty: 'Easy',
      ingredientsUserHas: userIngredients.filter((i) => /cabbage|egg|tomato/i.test(i)),
      ingredientsMissing: rawShop.map((s) => `${s.item} (${s.quantity})`),
      ingredients: [
        '1 small head Cabbage, thinly shredded',
        `${eggCount} Fresh eggs, whisked with salt`,
        '2 Tomatoes, chopped',
        '1 Onion, sliced (from home)',
        '2 tbsp Cooking oil & salt (from home)',
      ],
      steps: [
        'Heat 1 tbsp oil in a sufuria. Scramble the whisked eggs until fully set (no runny parts), then transfer to a plate.',
        'Add 1 tbsp oil to the same pot and sauté onions until translucent.',
        'Add tomatoes and cook 2 minutes, then stir in shredded cabbage and salt.',
        'Cook on medium-high heat for 4 minutes so cabbage stays slightly crisp, fold eggs back in, and serve hot.',
      ],
      tip: 'Cook eggs until firm and dry, and keep cabbage slightly crunchy so it stays flavorful and sweet.',
      estimatedCost: totalCost,
      shoppingList: rawShop,
    });
  }

  // Candidate C: Spiced Fried Githeri
  {
    const githeriPrice = servings <= 2 ? 75 : 150;
    const githeriQty = servings <= 2 ? '1/2 kg' : '1 kg';
    const rawShop = filterOutUserItems(
      [
        { item: 'Pre-boiled githeri (maize & beans)', quantity: githeriQty, price: githeriPrice },
        { item: 'Tomatoes', quantity: '1/4 kg', price: 25 },
        { item: 'Carrots', quantity: '1/4 kg (2 carrots)', price: 25 },
      ],
      userIngredients
    );
    const totalCost = rawShop.reduce((s, x) => s + x.price, 0);
    candidates.push({
      name: 'Fried Githeri with Carrots & Tomatoes',
      localName: 'Githeri ya Kukaanga',
      description: 'Hearty one-pot boiled maize and beans simmered in savory tomato-carrot gravy.',
      timeMinutes: 20,
      servings,
      difficulty: 'Easy',
      ingredientsUserHas: userIngredients.filter((i) => /githeri|bean|maize|carrot|tomato/i.test(i)),
      ingredientsMissing: rawShop.map((s) => `${s.item} (${s.quantity})`),
      ingredients: [
        `${githeriQty} Pre-boiled githeri`,
        '2 Tomatoes, diced',
        '2 Carrots, diced small',
        '1 Onion, diced (from home)',
        '2 tbsp Oil, salt & curry spice (from home)',
      ],
      steps: [
        'Heat oil in a sufuria and fry onions until golden.',
        'Add carrots and tomatoes with a pinch of salt; cover and cook 4 minutes until soft.',
        'Stir in pre-boiled githeri and 1/2 cup water.',
        'Simmer covered for 8–10 minutes until beans are soft and stew thickens.',
      ],
      tip: 'Buying pre-boiled githeri from the market saves fuel and cooks in under 20 minutes.',
      estimatedCost: totalCost,
      shoppingList: rawShop,
    });
  }

  // Candidate D: Ndengu (Green Grams) with Rice
  {
    const ricePrice = servings <= 2 ? 100 : 150;
    const riceQty = servings <= 2 ? '1/2 kg' : '3/4 kg';
    const ndenguPrice = servings <= 2 ? 55 : 110;
    const ndenguQty = servings <= 2 ? '1/4 kg' : '1/2 kg';
    const rawShop = filterOutUserItems(
      [
        { item: 'Rice (mchele)', quantity: riceQty, price: ricePrice },
        { item: 'Ndengu (green grams)', quantity: ndenguQty, price: ndenguPrice },
        { item: 'Tomatoes', quantity: '1/4 kg', price: 25 },
      ],
      userIngredients
    );
    const totalCost = rawShop.reduce((s, x) => s + x.price, 0);
    candidates.push({
      name: 'Steamed Rice & Savory Ndengu Stew',
      localName: 'Wali na Ndengu',
      description: 'Fluffy aromatic rice paired with rich, protein-packed green gram stew.',
      timeMinutes: 40,
      servings,
      difficulty: 'Easy',
      ingredientsUserHas: userIngredients.filter((i) => /rice|ndengu|green gram|tomato/i.test(i)),
      ingredientsMissing: rawShop.map((s) => `${s.item} (${s.quantity})`),
      ingredients: [
        `${riceQty} Rice, rinsed`,
        `${ndenguQty} Ndengu (green grams), boiled until soft`,
        '2 Tomatoes, chopped',
        '1 Onion, oil & salt (from home)',
      ],
      steps: [
        'Boil ndengu in water until completely soft (around 25 mins, or use pre-boiled ndengu).',
        'In a sufuria, fry onions until golden, add tomatoes and salt until saucy, then add ndengu and simmer 8 minutes.',
        'In a second pot (or after setting stew aside), boil salted water with 1 tbsp oil, add rice, cover tightly and steam on low for 15 minutes.',
        'Fluff rice with a fork and serve hot with ndengu stew.',
      ],
      tip: 'Mash two spoons of cooked ndengu against the sufuria wall to thicken the stew naturally.',
      estimatedCost: totalCost,
      shoppingList: rawShop,
    });
  }

  // Candidate E: Beef / Chicken / Fish specific if user selected protein
  if (has('beef') || has('goat') || has('chicken') || has('fish') || has('tilapia') || has('omena')) {
    const isChicken = has('chicken');
    const isFish = has('fish') || has('tilapia');
    const isOmena = has('omena');
    const proteinLabel = isOmena
      ? 'Omena'
      : isFish
        ? 'Tilapia'
        : isChicken
          ? 'Chicken'
          : 'Beef';
    const rawShop = filterOutUserItems(
      [
        { item: 'Maize flour (unga wa ugali)', quantity: '1 kg', price: 85 },
        { item: 'Tomatoes', quantity: '1/2 kg', price: 50 },
        { item: 'Sukuma wiki', quantity: '1 bunch', price: 20 },
      ],
      userIngredients
    );
    const totalCost = rawShop.reduce((s, x) => s + x.price, 0);
    candidates.unshift({
      name: `${proteinLabel} Wet Fry with Ugali & Greens`,
      localName: `${proteinLabel} Fry na Ugali`,
      description: `Hearty Kenyan ${proteinLabel.toLowerCase()} simmered in rich tomato gravy alongside hot ugali.`,
      timeMinutes: isOmena ? 25 : 40,
      servings,
      difficulty: 'Medium',
      ingredientsUserHas: userIngredients.filter((i) =>
        /beef|goat|chicken|fish|tilapia|omena|tomato|maize|ugali|sukuma/i.test(i)
      ),
      ingredientsMissing: rawShop.map((s) => `${s.item} (${s.quantity})`),
      ingredients: [
        `${proteinLabel} from your kitchen`,
        '1/2 kg Tomatoes, chopped',
        '1 kg Maize flour (unga wa ugali)',
        '1 bunch Sukuma wiki',
        'Onions, oil, salt & water (from home)',
      ],
      steps: [
        isFish
          ? 'Season fish with salt, fry in hot oil until golden brown on both sides and flesh flakes easily.'
          : isOmena
            ? 'Wash omena in warm water, drain well, and pan-fry until crisp before adding onions and tomatoes.'
            : 'Boil or sear meat until fully cooked through with no pink inside (74°C for chicken).',
        'Fry onions until golden, add tomatoes and simmer into a thick wet-fry sauce with the cooked protein.',
        'Quickly sauté sukuma wiki with a pinch of salt and boil water to stir firm ugali.',
      ],
      tip: 'Always ensure chicken, meat, or fish is thoroughly cooked before serving.',
      estimatedCost: totalCost,
      shoppingList: rawShop,
    });
  }

  // Sort by lowest cost first so budget filtering is clean
  const sorted = [...candidates].sort((a, b) => a.estimatedCost - b.estimatedCost);

  if (hasBudget && budgetKsh !== null) {
    const withinBudget = sorted.filter((m) => m.estimatedCost <= budgetKsh);
    if (withinBudget.length === 0) {
      const lowest = sorted[0];
      return {
        meals: [],
        budgetTooLow: true,
        suggestedMinBudget: lowest.estimatedCost,
        lowestCostMeal: lowest,
        friendlyBudgetMessage: `KSh ${budgetKsh} is a bit tight for ${servings} ${servings === 1 ? 'person' : 'people'}. The cheapest balanced meal needs around KSh ${lowest.estimatedCost}.`,
      };
    }
    return { meals: withinBudget.slice(0, 3), budgetTooLow: false };
  }

  return { meals: sorted.slice(0, 3), budgetTooLow: false };
}

const mealResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'Descriptive meal name in English or common Kenyan format.',
      },
      localName: {
        type: Type.STRING,
        description: 'Swahili or local Kenyan name (e.g., Ugali na Sukuma Wiki, Wali wa Ndengu).',
      },
      description: {
        type: Type.STRING,
        description: 'One-line appetizing description of the meal.',
      },
      timeMinutes: {
        type: Type.INTEGER,
        description: 'Total cooking and prep time in minutes.',
      },
      servings: {
        type: Type.INTEGER,
        description: 'Number of people this recipe serves.',
      },
      difficulty: {
        type: Type.STRING,
        description: 'Difficulty level: Easy or Medium.',
      },
      ingredientsUserHas: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Items from the user\'s list used in this recipe (empty array if user selected no ingredients).',
      },
      ingredientsMissing: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Items the user needs to buy, if any.',
      },
      ingredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Full list of ingredients with practical Kenyan measurements.',
      },
      steps: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Step-by-step numbered instructions written in simple, clear English.',
      },
      tip: {
        type: Type.STRING,
        description: 'One short, practical home cook tip for best flavor, burner conservation, or food safety.',
      },
      estimatedCost: {
        type: Type.INTEGER,
        description: 'Total cost in KSh covering ONLY the items in shoppingList (0 if nothing needs to be bought).',
      },
      shoppingList: {
        type: Type.ARRAY,
        description: 'Exact list of items the user must buy (never include salt, oil, water, onions, basic spices, or ingredients the user already has).',
        items: {
          type: Type.OBJECT,
          properties: {
            item: {
              type: Type.STRING,
              description: 'Name of the item to buy.',
            },
            quantity: {
              type: Type.STRING,
              description: 'Portion size to buy (e.g., "1/2 kg", "1 bunch", "3 pieces").',
            },
            price: {
              type: Type.INTEGER,
              description: 'Cost in KSh for this quantity based on the provided price list.',
            },
            isApproximate: {
              type: Type.BOOLEAN,
              description: 'True only if the item was NOT on the provided price list and had to be estimated.',
            },
          },
          required: ['item', 'quantity', 'price'],
        },
      },
    },
    required: [
      'name',
      'localName',
      'description',
      'timeMinutes',
      'servings',
      'difficulty',
      'ingredientsUserHas',
      'ingredientsMissing',
      'ingredients',
      'steps',
      'tip',
      'estimatedCost',
      'shoppingList',
    ],
  },
};

async function callGeminiForMeals(
  systemInstruction: string,
  userPrompt: string
): Promise<any[]> {
  const generatePromise = ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.5,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
      responseMimeType: 'application/json',
      responseSchema: mealResponseSchema,
    },
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI generation timeout after 25s')), 25000)
  );

  const response = await Promise.race([generatePromise, timeoutPromise]);
  const text = response.text?.trim() || '';
  if (!text) {
    throw new Error('Empty response from model');
  }
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : parsed.meals || [];
}

// Route to suggest 3 meals (Ingredients only, Budget only, or Both)
app.post('/api/suggest-meals', async (req, res) => {
  try {
    const {
      ingredients = [],
      budgetKsh = null,
      timeLimit = 'Any time',
      servings = 4,
      cookingSetup = 'One burner',
      useExpiringSoon = false,
    } = req.body as RecipeRequest;

    const cleanIngredients = Array.isArray(ingredients)
      ? ingredients.map((i) => String(i).trim()).filter(Boolean)
      : [];
    const parsedBudget =
      budgetKsh !== null && budgetKsh !== undefined && Number(budgetKsh) > 0
        ? Math.round(Number(budgetKsh))
        : null;
    const hasBudget = parsedBudget !== null && parsedBudget > 0;

    if (cleanIngredients.length === 0 && !hasBudget) {
      return res.status(400).json({
        error: 'Please select at least one ingredient or enter a budget in KSh.',
      });
    }

    const priceTable = formatPriceListForPrompt();
    const ingredientsList =
      cleanIngredients.length > 0 ? cleanIngredients.join(', ') : 'None selected (shopping from scratch)';

    const modeDescription =
      cleanIngredients.length === 0 && hasBudget
        ? `MODE 1 — BUDGET ONLY: The user has NO main ingredients at home (except free staples: salt, cooking oil, water, onions, basic spices). Suggest 3 realistic Kenyan meals they can cook by buying everything needed for KSh ${parsedBudget} or less.`
        : cleanIngredients.length > 0 && !hasBudget
          ? `MODE 2 — INGREDIENTS ONLY: Build meals mainly from the user's listed ingredients (${ingredientsList}). Each meal may have at most 2 cheap missing items from a local duka/market. Also populate shoppingList and estimatedCost for any missing items (or empty shoppingList and 0 cost if nothing needs to be bought).`
          : `MODE 3 — INGREDIENTS + BUDGET: Build meals around the ingredients the user already has (${ingredientsList}) which cost KSh 0. Any extra items they need to buy in shoppingList must cost KSh ${parsedBudget} or less in total.`;

    const budgetRules = hasBudget
      ? `
BUDGET & PRICING RULES (STRICT)
1. Total cost of items to buy in shoppingList (estimatedCost) MUST NOT exceed KSh ${parsedBudget}.
2. Replace any "at most 2 missing items" rule with "stay strictly within KSh ${parsedBudget} total". You may buy as many items as needed as long as their summed price is <= KSh ${parsedBudget}.
3. Use ONLY the Kenyan market prices provided below. Choose smaller realistic portions (e.g. 1/2 kg, 1/4 kg, 2 pieces, 1 bunch, a handful) and calculate fractional prices proportionally so meals fit KSh ${parsedBudget}.
4. If an item is NOT on the price list, estimate its Kenyan duka/market price carefully and set isApproximate: true.
5. NEVER include salt, cooking oil, water, onions, basic spices, or ingredients the user already listed in shoppingList — those are already at home and cost KSh 0.`
      : `
MISSING ITEMS & PRICING RULES
1. Each meal may have at most 2 missing items, and only cheap, common ones from a local duka or market. If a meal needs more, choose a different meal.
2. Calculate estimatedCost and shoppingList for any missing items using ONLY the Kenyan market prices provided below (or mark isApproximate: true if not listed). If the user has everything needed, set shoppingList: [] and estimatedCost: 0.
3. NEVER include salt, cooking oil, water, onions, basic spices, or ingredients the user already listed in shoppingList.`;

    const systemInstruction = `You are a friendly Kenyan home cook who helps people decide what to cook with what they already have or with their budget.

Suggest exactly 3 different meals the user can cook today.

${modeDescription}

${budgetRules}

GENERAL RULES
1. Assume the user always has salt, cooking oil, water, onions and basic spices at home. Never count these as missing or charge them to the budget.
2. Make the 3 meals clearly different from each other: a different main dish, cooking method or starch. Never give three stews.
3. Prefer real Kenyan and East African home dishes. Use a dish from the reference list when it fits.
4. Respect the filters. Total time must be within the time limit. Scale every quantity realistically for ${servings} ${servings === 1 ? 'person' : 'people'} eating. Use only methods that work on the cooking setup (no oven unless the user has one).
5. ${cleanIngredients.length > 0 ? 'If the user wants to use up items that may go bad soon, use the most perishable ones (greens, tomatoes, fish, meat, bananas) in at least two of the meals.' : 'Keep portions realistic and filling for the number of people eating.'}
6. Order the meals from best fit to least fit.
7. Use practical Kenyan measurements (cups, tablespoons, bunches, 1/4 kg, 1/2 kg, pieces). Write steps in simple, clear English, short sentences, one action per step.
8. Give food safety advice: meat and chicken cooked through, fish flaking easily, beans fully soft.
9. Never suggest strange or unsafe combinations.

KENYAN MARKET PRICE LIST (KSh)
${priceTable}

REFERENCE LIST OF KENYAN HOME DISHES
Ugali na sukuma wiki, ugali na nyama, ugali na samaki, ugali na omena, ugali na managu or terere, githeri, muthokoi, mukimo, irio, matoke na nyama, pilau, wali wa nazi, wali na maharagwe, wali na ndengu, ndengu na chapati, maharagwe ya nazi, chapati, mandazi, mahamri, viazi karai, kima (minced meat stew), mayai ya kukaanga, kabeji na mayai, samaki wa kukaanga, mchuzi wa samaki, kuku wa kukaanga, kuku kienyeji stew, nduma or sweet potato boiled with tea, malenge stew, kachumbari.

OUTPUT
Return strictly a valid JSON array of exactly 3 meals matching the schema.`;

    const userPrompt = `User inputs:
- Ingredients already at home: ${ingredientsList}
- Budget for buying ingredients: ${hasBudget ? `KSh ${parsedBudget} maximum` : 'No fixed budget specified'}
- Time limit: ${timeLimit}
- People eating (servings): ${servings}
- Cooking setup: ${cookingSetup}
- Prioritize using up items that may go bad soon: ${useExpiringSoon ? 'Yes' : 'No'}

Suggest 3 distinct, realistic, delicious Kenyan meals. Return ONLY a JSON array of 3 meal objects.`;

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set. Using Kenyan home cooking fallback generator.');
      const fallbackResult = generateFallbackKenyanMeals({
        ingredients: cleanIngredients,
        budgetKsh: parsedBudget,
        timeLimit,
        servings,
        cookingSetup,
        useExpiringSoon,
      });
      return res.json({
        ...fallbackResult,
        budgetKsh: parsedBudget,
      });
    }

    // Attempt 1
    const rawAttempt1 = await callGeminiForMeals(systemInstruction, userPrompt);
    const normalized1 = rawAttempt1
      .map((m) => normalizeAndVerifyMeal(m, cleanIngredients, servings))
      .filter((m) => m.steps.length > 0);

    if (!hasBudget) {
      const good = normalized1.filter((m) => m.ingredientsMissing.length <= 2);
      const meals = (good.length >= 2 ? good : normalized1).slice(0, 3);
      if (meals.length === 0) {
        throw new Error('No meals returned in structure');
      }
      return res.json({
        meals,
        budgetKsh: null,
        budgetTooLow: false,
      });
    }

    // SERVER CHECK FOR BUDGET MODE: sum shoppingList prices in code and drop any over budget
    let validMeals = normalized1.filter((m) => m.estimatedCost <= parsedBudget!);
    const allCandidates: MealSuggestion[] = [...normalized1];

    // If fewer than 2 meals remain under budget, retry Gemini ONCE more
    if (validMeals.length < 2) {
      const retryPrompt = `IMPORTANT CORRECTION: Your previous suggestions exceeded the user's strict budget of KSh ${parsedBudget}.
Try again and suggest 3 clearly different, realistic Kenyan meals for ${servings} ${servings === 1 ? 'person' : 'people'} where the sum of shoppingList prices is STRICTLY KSh ${parsedBudget} or less!
Use affordable Kenyan staples (like ugali, sukuma wiki, cabbage, eggs, omena, githeri, beans, ndengu) and realistic small portions (1/4 kg, 1/2 kg, 1 bunch, individual eggs) from the price list.
Ingredients already at home (cost KSh 0): ${ingredientsList}.
Cooking setup: ${cookingSetup}, Time limit: ${timeLimit}.`;

      try {
        const rawRetry = await callGeminiForMeals(systemInstruction, retryPrompt);
        const normalizedRetry = rawRetry
          .map((m) => normalizeAndVerifyMeal(m, cleanIngredients, servings))
          .filter((m) => m.steps.length > 0);

        allCandidates.push(...normalizedRetry);
        const retryValid = normalizedRetry.filter((m) => m.estimatedCost <= parsedBudget!);

        const seenNames = new Set(validMeals.map((m) => m.name.toLowerCase()));
        for (const meal of retryValid) {
          if (!seenNames.has(meal.name.toLowerCase())) {
            validMeals.push(meal);
            seenNames.add(meal.name.toLowerCase());
          }
        }
      } catch (retryErr) {
        console.warn('Retry for budget compliance failed:', retryErr);
      }
    }

    validMeals = validMeals.slice(0, 3);

    // If after retry NO meal fits the budget, NEVER show an over-budget meal in `meals`.
    // Instead return budgetTooLow with a friendly message and the lowest cost option.
    if (validMeals.length === 0) {
      const fallbackCheck = generateFallbackKenyanMeals({
        ingredients: cleanIngredients,
        budgetKsh: parsedBudget,
        timeLimit,
        servings,
        cookingSetup,
        useExpiringSoon,
      });

      if (fallbackCheck.meals.length > 0) {
        return res.json({
          meals: fallbackCheck.meals,
          budgetKsh: parsedBudget,
          budgetTooLow: false,
        });
      }

      const sortedCandidates = [...allCandidates].sort(
        (a, b) => a.estimatedCost - b.estimatedCost
      );
      const lowestAiMeal = sortedCandidates[0];
      const lowestFallback = fallbackCheck.lowestCostMeal;
      const lowestCostMeal =
        lowestFallback &&
        (!lowestAiMeal || lowestFallback.estimatedCost <= lowestAiMeal.estimatedCost)
          ? lowestFallback
          : lowestAiMeal;

      const minBudget = lowestCostMeal?.estimatedCost || parsedBudget! + 50;

      return res.json({
        meals: [],
        budgetKsh: parsedBudget,
        budgetTooLow: true,
        suggestedMinBudget: minBudget,
        lowestCostMeal,
        friendlyBudgetMessage: `KSh ${parsedBudget} is a little too small to buy a full meal for ${servings} ${servings === 1 ? 'person' : 'people'}. With about KSh ${minBudget}, you can make a satisfying Kenyan meal.`,
      });
    }

    return res.json({
      meals: validMeals,
      budgetKsh: parsedBudget,
      budgetTooLow: false,
    });
  } catch (error: any) {
    console.error('Error generating meals with Gemini API:', error);
    try {
      const fallbackResult = generateFallbackKenyanMeals(req.body);
      return res.json({
        ...fallbackResult,
        budgetKsh: req.body?.budgetKsh ? Math.round(Number(req.body.budgetKsh)) : null,
        fallbackNote:
          'Generated from Tupike local Kenyan kitchen guide while updating online connection.',
      });
    } catch (_fallbackError) {
      return res.status(500).json({
        error:
          'Pole sana! We had trouble creating the recipes right now. Please tap Retry.',
      });
    }
  }
});

// Configure Vite middleware in development or serve static in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tupike server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
