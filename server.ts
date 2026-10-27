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

interface RecipeRequest {
  ingredients: string[];
  timeLimit?: string;
  servings?: number;
  cookingSetup?: string;
  useExpiringSoon?: boolean;
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
}

// Fallback generator for realistic, high-quality Kenyan home recipes if API key is absent or network fails
function generateFallbackKenyanMeals(req: RecipeRequest): MealSuggestion[] {
  const userIngredients = req.ingredients.map(i => i.toLowerCase());
  const servings = req.servings || 4;
  const setup = req.cookingSetup || 'One burner';

  const has = (key: string) => userIngredients.some(i => i.includes(key));

  const meals: MealSuggestion[] = [];

  // Recipe 1: Ugali or rice or grain based
  if (has('sukuma') || has('spinach') || has('cabbage') || has('egg') || has('maize') || has('flour')) {
    meals.push({
      name: 'Ugali with Sautéed Greens & Quick Fried Eggs',
      localName: 'Ugali, Sukuma Wiki na Mayai',
      description: 'The beloved quintessential Kenyan comfort dinner, quick to whip up on a single burner.',
      timeMinutes: 25,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /sukuma|spinach|cabbage|egg|maize|ugali|tomato|onion/i.test(i)),
      ingredientsMissing: userIngredients.some(i => /maize|ugali/i.test(i)) ? [] : ['Maize flour (unga wa ugali)'],
      ingredients: [
        '2 cups Maize flour (unga wa ugali)',
        '3 cups Water',
        '1 bunch Sukuma wiki or Spinach, finely shredded',
        '3 Fresh eggs',
        '1 medium Onion, diced',
        '2 ripe Tomatoes, finely chopped',
        '2 tbsp Vegetable oil',
        '1 tsp Salt to taste'
      ],
      steps: [
        'Greens: Heat 1 tbsp oil in a sufuria. Fry half the onions till translucent, add tomatoes and cook until mashed. Add greens and salt, stir fry for 5 minutes, then cover off-heat.',
        'Eggs: In a small pan or the same pot, fry eggs sunny-side up or scramble with a pinch of salt.',
        'Ugali: Boil water in a sufuria. Add maize flour gradually while stirring with a wooden mwiko to prevent lumps. Press against sides of the pot until firm and aromatic (around 7-10 minutes). Shape into a neat mound.',
        'Serve hot immediately with a slice of avocado if on hand.'
      ],
      tip: 'Let your ugali steam covered on the lowest ember or burner flame for 2 minutes before serving for that authentic smoky aroma.'
    });
  } else {
    meals.push({
      name: 'Spiced Tomato Herb Rice Stew',
      localName: 'Wali wa Nyanya na Mboga',
      description: 'Fragrant golden rice steamed in savory tomato base with household spices.',
      timeMinutes: 30,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /rice|tomato|onion|garlic|pea|carrot/i.test(i)),
      ingredientsMissing: userIngredients.some(i => /rice/i.test(i)) ? [] : ['Rice (mchele)'],
      ingredients: [
        '2 cups Long grain white rice, washed',
        '3 large ripe Tomatoes, blended or grated',
        '1 large Onion, sliced',
        '3 tbsp Cooking oil',
        '1 tsp Curry powder or Royco (optional)',
        '1 tsp Salt',
        '3.5 cups Water'
      ],
      steps: [
        'Heat oil in a heavy-bottomed sufuria over medium heat. Fry onions until golden brown.',
        'Add tomatoes and salt, cooking down until oil separates and creates a thick paste.',
        'Stir in washed rice to coat with the tomato sauce for 1 minute.',
        'Pour in water, bring to a rapid boil, then reduce heat to low and cover tightly for 15-18 minutes until tender and fluffy.'
      ],
      tip: 'Wash the rice until water runs clear to keep individual grains separate and non-sticky.'
    });
  }

  // Recipe 2: Hearty protein or legume or fish stew
  if (has('fish') || has('tilapia')) {
    meals.push({
      name: 'Crispy Deep-Fried Tilapia in Tomato Coconut Stew',
      localName: 'Samaki wa Kupaka / Wet Fry',
      description: 'Whole or fillet Lake Victoria tilapia crisped and glazed in savory onion-tomato sauce.',
      timeMinutes: 30,
      servings: servings,
      difficulty: 'Medium',
      ingredientsUserHas: req.ingredients.filter(i => /fish|tilapia|tomato|onion|lemon/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        '1 Whole fresh Tilapia (cleaned and scored) or 400g fillets',
        '2 tbsp Lemon juice and 1 tsp salt for seasoning',
        '3 large ripe Tomatoes, finely chopped',
        '1 large Onion, sliced',
        'Oil for frying',
        '1/2 cup Coconut milk or water'
      ],
      steps: [
        'Season fish with lemon juice and salt. Let rest for 5 minutes.',
        'Heat oil in a deep pan. Fry fish over medium-high heat until skin is golden brown and crisp (approx 5-6 mins per side). Safe check: fish flakes easily with a fork.',
        'In a separate sufuria, sauté onions until soft, add tomatoes and simmer into a thick gravy.',
        'Gently lower fried tilapia into the simmering gravy. Spoon sauce over the fish and simmer for 4 minutes to absorb flavors.',
        'Serve with hot ugali and steamed kachumbari or sukuma wiki.'
      ],
      tip: 'Score the fish diagonally on both sides before frying—this ensures even cooking all the way to the bone.'
    });
  } else if (has('managu') || has('terere')) {
    meals.push({
      name: 'Creamy Kienyeji Traditional Greens Stew',
      localName: 'Managu na Terere ya Maziwa',
      description: 'Nutritious indigenous greens sautéed with onions and finished with a splash of milk or cream.',
      timeMinutes: 20,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /managu|terere|milk|tomato|onion/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        '2 bunches Managu or Terere leaves (plucked and washed thoroughly)',
        '1 large Onion, sliced',
        '2 ripe Tomatoes, chopped',
        '1/2 cup Fresh whole milk or mala (optional, cuts bitterness)',
        '2 tbsp Vegetable oil',
        '1/2 tsp Salt'
      ],
      steps: [
        'Parboil leaves in a little salted water for 4-5 minutes, then drain.',
        'Heat oil in a sufuria. Fry onions until golden brown, then add tomatoes and cook until soft.',
        'Add the parboiled greens and stir fry for 5 minutes.',
        'Pour in the milk or cream, turn heat to low, and let simmer gently for 3 minutes until rich and creamy.',
        'Serve with steaming hot brown or white ugali.'
      ],
      tip: 'Adding a splash of whole milk or fermented mala at the end rounds out the natural earthy bitterness of managu.'
    });
  } else if (has('githeri')) {
    meals.push({
      name: 'Special Fried Githeri with Carrots & Potatoes',
      localName: 'Githeri ya Kukaanga',
      description: 'Kenya\'s ultimate powerhouse combo of boiled maize and beans pan-fried with sweet carrots and spices.',
      timeMinutes: 20,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /githeri|bean|maize|carrot|potato|tomato|onion/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        '3 cups Boiled Githeri (maize and beans mixed)',
        '1 large Onion, diced',
        '2 large Tomatoes, blended',
        '1 Carrot, diced small',
        '1 Potato, finely cubed (optional)',
        '2 tbsp Cooking oil',
        '1 tsp Salt and Royco / curry powder to taste'
      ],
      steps: [
        'Heat cooking oil in a sufuria. Fry onions until sweet and golden.',
        'Add diced carrots, potatoes, and tomatoes. Cook down covered for 5 minutes until potatoes start softening.',
        'Add the boiled githeri and salt. Stir well to coat with the rich tomato sauce.',
        'Add 1/2 cup water, cover and simmer on low heat for 8-10 minutes so flavors seep into the grains.',
        'Serve hot with a generous wedge of ripe avocado and hot chai.'
      ],
      tip: 'Slightly crush a small portion of the maize and beans with your cooking spoon to make the stew thick and rich.'
    });
  } else if (has('omena')) {
    meals.push({
      name: 'Crispy Pan-Fried Omena in Onion Tomato Gravy',
      localName: 'Omena Fry ya Nyanya',
      description: 'Sun-dried Lake Victoria sardines fried crisp then simmered with ripe tomatoes and onions.',
      timeMinutes: 20,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /omena|tomato|onion|lemon|chili/i.test(i)),
      ingredientsMissing: userIngredients.some(i => /tomato/i.test(i)) ? [] : ['2 ripe tomatoes'],
      ingredients: [
        '2 cups Dried Omena (washed thoroughly in warm water)',
        '2 tbsp Lemon juice or vinegar (to reduce bitterness)',
        '2 large ripe Tomatoes, diced',
        '1 large Onion, finely chopped',
        '3 tbsp Cooking oil',
        '1/2 tsp Salt',
        'Optional green chilies (pilipili)'
      ],
      steps: [
        'Clean omena in warm salted water twice to remove grit and drain thoroughly.',
        'Heat 2 tbsp oil in a sufuria. Dry-fry the omena over medium heat until golden and crispy (approx. 5 minutes). Remove and set aside.',
        'In the same pan, heat remaining oil, fry onions until golden, then add tomatoes and lemon juice. Cook until thick gravy forms.',
        'Toss crispy omena back into the sauce, simmer gently for 3-4 minutes so flavors marry while keeping texture.',
        'Serve with hot ugali or chapati.'
      ],
      tip: 'Washing omena in warm water with a splash of lemon or vinegar cuts bitterness and ensures tender, sweet flavor.'
    });
  } else if (has('beef') || has('goat') || has('meat') || has('chicken')) {
    const meatType = has('chicken') ? 'Kuku' : has('goat') ? 'Mbuzi' : 'Nyama';
    meals.push({
      name: `Savory Kenyan ${has('chicken') ? 'Chicken' : 'Beef'} Wet Fry Stew`,
      localName: `${meatType} Wet Fry with Rich Gravy`,
      description: 'Succulent tender meat simmered with caramelized onions and thick tomato reduction.',
      timeMinutes: 45,
      servings: servings,
      difficulty: 'Medium',
      ingredientsUserHas: req.ingredients.filter(i => /beef|chicken|meat|goat|tomato|onion|potato|carrot/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        `500g ${has('chicken') ? 'Chicken pieces' : 'Beef/Goat meat cut into bite-sized cubes'}`,
        '2 large Onions, sliced',
        '3 large ripe Tomatoes, blended or grated',
        '2 medium Potatoes or Carrots (optional), cubed',
        '2 tbsp Cooking oil',
        '1 tsp Salt and 1/2 tsp black pepper',
        '1 cup Water or meat broth'
      ],
      steps: [
        `Safety check: Boil ${has('chicken') ? 'chicken until juices run completely clear (internal temp 74°C/165°F)' : 'meat in 1 cup salted water until fork tender, about 25 mins'}. Reserve remaining stock.`,
        'In a sufuria, heat oil and brown onions deeply until rich amber brown.',
        'Add meat pieces and sear over high heat for 3 minutes to lock in flavors.',
        'Add tomatoes, potatoes/carrots, and reserved broth. Simmer covered for 12-15 minutes until gravy is thick and glossy.',
        'Rest for 3 minutes, then serve hot with ugali, chapati, or steamed rice.'
      ],
      tip: 'Do not rush the onions—browning them gives authentic wet-fry deep savory sweetness without needing artificial bouillon cubes.'
    });
  } else if (has('ndengu') || has('bean') || has('njahi')) {
    meals.push({
      name: 'Hearty Coconut Green Grams / Beans Stew',
      localName: 'Ndengu / Maharagwe ya Nazi',
      description: 'Soft legumes simmered in aromatics with a rich, silky finish.',
      timeMinutes: 30,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /ndengu|bean|njahi|coconut|tomato|onion|carrot/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        '2 cups Boiled ndengu (green grams) or beans',
        '1 medium Onion, chopped',
        '2 ripe Tomatoes, chopped',
        '1 Carrot, grated or cubed',
        '1/2 cup Coconut milk or water',
        '2 tbsp Oil',
        '1 tsp Salt and basic curry spice'
      ],
      steps: [
        'Heat oil in a sufuria. Fry onions until soft and slightly golden.',
        'Add carrots and tomatoes. Cook down covered for 4 minutes until a smooth sauce forms.',
        'Add cooked ndengu/beans and salt. Stir to combine.',
        'Pour in coconut milk (or water), reduce heat to low, and simmer for 8-10 minutes until thick and aromatic.',
        'Serve alongside chapati, rice, or enjoy as a standalone soup.'
      ],
      tip: 'Slightly mash 2 spoonfuls of the beans or ndengu against the side of the pot to naturally thicken the stew gravy.'
    });
  } else {
    meals.push({
      name: 'Comforting Vegetable & Potato Stew',
      localName: 'Mchuzi wa Mboga na Viazi',
      description: 'Wholesome potato cubes and garden vegetables braised in aromatic onion-tomato broth.',
      timeMinutes: 25,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /potato|carrot|pea|cabbage|tomato|onion/i.test(i)),
      ingredientsMissing: userIngredients.some(i => /potato/i.test(i)) ? [] : ['Potatoes (viazi)'],
      ingredients: [
        '4 medium Potatoes, peeled and quartered',
        '1 cup Shredded cabbage or peas/carrots',
        '2 large Tomatoes, chopped',
        '1 large Onion, sliced',
        '2 tbsp Cooking oil',
        '1 tsp Salt',
        '1.5 cups Water'
      ],
      steps: [
        'Heat cooking oil in a sufuria. Sauté onions until fragrant.',
        'Add tomatoes and cook until juicy and tender.',
        'Drop in potato chunks and any veggies. Coat in the tomato sauce.',
        'Add water and salt, bring to a boil, then cover and simmer over medium heat for 15 minutes until potatoes are easily pierced with a fork.',
        'Serve with chapati, rice, or bread.'
      ],
      tip: 'Poke potatoes with a knife tip—when soft to the center, turn off flame so they retain their hearty shape.'
    });
  }

  // Recipe 3: Matoke, Chapati, Githeri or quick breakfast/supper
  if (has('banana') || has('matoke')) {
    meals.push({
      name: 'Simmered Green Banana Stew',
      localName: 'Matoke ya Nyama au Mboga',
      description: 'Tender plantain bananas infused with onions, tomatoes, and gentle spices.',
      timeMinutes: 30,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /matoke|banana|tomato|onion|carrot|potato/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        '6-8 Green cooking bananas (matoke), peeled and soaked in salted water',
        '2 Tomatoes, chopped',
        '1 Onion, chopped',
        '2 tbsp Vegetable oil',
        '1.5 cups Water or light broth',
        '1 tsp Salt'
      ],
      steps: [
        'Rub a little oil on hands before peeling green bananas to prevent sticking sap. Cut bananas into halves.',
        'In a sufuria, fry onions in oil until fragrant. Stir in tomatoes and cook down.',
        'Add the drained bananas and salt. Pour in water just barely covering the matoke.',
        'Cover and simmer on medium-low flame for 20 minutes until bananas are melt-in-the-mouth soft and broth is rich.',
        'Serve hot with a side of greens or stew.'
      ],
      tip: 'Peeling matoke under running water or dipping hands in cooking oil prevents banana sap from staining your fingers.'
    });
  } else if (has('arrow') || has('nduma') || has('sweet potato') || has('ngwaci') || has('cassava') || has('muhogo')) {
    meals.push({
      name: 'Boiled & Pan-Tossed Roots with Onions',
      localName: 'Nduma, Ngwaci na Muhogo wa Kukaanga',
      description: 'Earthy indigenous tuber roots boiled fork-tender and pan-tossed in sweet caramelized onions.',
      timeMinutes: 25,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /arrow|nduma|sweet|potato|ngwaci|cassava|muhogo|onion/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        '500g Nduma (arrow roots), Ngwaci (sweet potato), or Muhogo (cassava), peeled & chunked',
        '1 large Onion, sliced',
        '2 tbsp Cooking oil',
        '1 tsp Salt',
        '2 cups Water for boiling'
      ],
      steps: [
        'Place peeled root chunks in a sufuria with salted water. Cover and boil until fork tender (15-18 mins). Drain thoroughly.',
        'Heat 2 tbsp oil in the same pan. Sauté onions over medium flame until fragrant and golden.',
        'Add the cooked root chunks and gently toss in the onion oil for 3-4 minutes to develop a delicate crisp crust.',
        'Serve hot alongside Kenyan spiced milk chai or fresh avocado slices.'
      ],
      tip: 'Boil with a pinch of salt so the natural sweetness of nduma or ngwaci is enhanced from the inside out.'
    });
  } else if (has('pumpkin') || has('malenge')) {
    meals.push({
      name: 'Simmered Golden Pumpkin & Vegetable Stew',
      localName: 'Malenge ya Kukaanga na Nyanya',
      description: 'Sweet, velvety pumpkin wedges braised with ripe tomatoes and garden onions.',
      timeMinutes: 20,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /pumpkin|malenge|tomato|onion|carrot/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        '500g Pumpkin (malenge), peeled and cut into 1-inch cubes',
        '2 ripe Tomatoes, diced',
        '1 Onion, chopped',
        '2 tbsp Oil',
        '1/2 tsp Salt and black pepper',
        '1 cup Water or coconut milk'
      ],
      steps: [
        'Heat oil in a sufuria. Fry onions until soft.',
        'Add tomatoes and cook until saucy.',
        'Add pumpkin cubes and salt. Stir to coat with sauce.',
        'Add water or coconut milk, cover and simmer on gentle heat for 12-15 minutes until pumpkin is tender and sauce is thick.',
        'Serve with chapati, rice, or ugali.'
      ],
      tip: 'Do not stir violently once pumpkin is tender to keep the cubes beautifully intact.'
    });
  } else if (has('chapati') || has('wheat')) {
    meals.push({
      name: 'Layered Soft Kenyan Chapatis',
      localName: 'Chapati za Ngozi Laini',
      description: 'Golden, flaky flatbreads rolled with oil layers, made in a simple tawa or frying pan.',
      timeMinutes: 40,
      servings: servings,
      difficulty: 'Medium',
      ingredientsUserHas: req.ingredients.filter(i => /chapati|wheat|flour|oil|salt/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        '3 cups All-purpose or chapati wheat flour',
        '1 tsp Salt',
        '1 tbsp Sugar (optional for color)',
        '3 tbsp Warm oil + extra for brushing and frying',
        '1 to 1.25 cups Warm water'
      ],
      steps: [
        'In a bowl, mix flour, salt, and warm oil. Gradually add warm water while kneading until a soft, non-sticky dough forms (5-7 mins).',
        'Cover dough with a damp cloth and rest for 15-20 minutes.',
        'Divide into balls, roll flat, brush with oil, cut a slit and roll into a cone, then press down to create flaky layers.',
        'Roll each into a circle. Dry fry on a medium-hot pan until bubbles appear, brush with oil on both sides, and toast until golden spots appear.',
        'Stack in a covered hotpot to stay extra soft.'
      ],
      tip: 'Resting the dough for at least 15 minutes relaxes gluten so chapatis stay soft until the next morning.'
    });
  } else {
    meals.push({
      name: 'Fried Cabbage & Carrot Stir-Fry with Eggs',
      localName: 'Kabeji ya Kukaanga na Mayai',
      description: 'Crisp, sweet shredded cabbage quickly tossed with warm onions and fluffy eggs.',
      timeMinutes: 15,
      servings: servings,
      difficulty: 'Easy',
      ingredientsUserHas: req.ingredients.filter(i => /cabbage|carrot|egg|onion|tomato/i.test(i)),
      ingredientsMissing: [],
      ingredients: [
        '1/2 head Cabbage, thinly shredded',
        '1 Carrot, julienned',
        '2-3 Eggs, whisked with salt',
        '1 Onion, sliced',
        '2 tbsp Oil',
        'Salt and black pepper to taste'
      ],
      steps: [
        'Heat 1 tbsp oil in a sufuria or pan. Scramble the eggs quickly until just set, then slide out onto a plate.',
        'Add remaining oil, sauté onions for 2 minutes until translucent.',
        'Toss in shredded cabbage and carrots. Stir fry on high heat for 3-4 minutes so it stays pleasantly crunchy.',
        'Fold in the scrambled eggs and season with salt and pepper.',
        'Serve with ugali, bread, or warm tea.'
      ],
      tip: 'Do not overcook cabbage; keeping it slightly crunchy preserves both fresh sweet flavor and vibrant nutrients.'
    });
  }

  return meals.slice(0, 3);
}

// Route to suggest 3 meals
app.post('/api/suggest-meals', async (req, res) => {
  try {
    const {
      ingredients = [],
      timeLimit = 'Any time',
      servings = 4,
      cookingSetup = 'One or two burners',
      useExpiringSoon = false,
    } = req.body as RecipeRequest;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one ingredient.' });
    }

    const ingredientsList = ingredients.join(', ');

    const systemInstruction = `You are a friendly Kenyan home cook. Suggest exactly 3 realistic meals using mainly the ingredients the user has, plus basic staples (salt, oil, water, onions, simple spices). Prefer Kenyan and East African dishes and home cooking style (for example ugali and sukuma wiki, githeri, pilau, mukimo, matoke, chapati, kienyeji style stews, fried omena, mandazi). Use simple methods that work on one or two burners or a jiko, and don't require an oven unless the user said they have one. Respect the time, serving and cooking setup filters. Never invent unusual or unsafe ingredient combinations. If the ingredients are too few or don't work together, say so honestly and suggest the one or two cheap items that would unlock a good meal. Give cooking temperatures and doneness advice for meat, chicken and fish so food is cooked safely.
Return strictly a valid JSON array of exactly 3 meals matching the specified schema.`;

    const userPrompt = `I have these ingredients at home: ${ingredientsList}.
User preferences & kitchen setup:
- Time limit: ${timeLimit}
- People eating (servings): ${servings}
- Cooking setup: ${cookingSetup}
- Prioritize using up items that may go bad soon: ${useExpiringSoon ? 'Yes' : 'No'}

Suggest exactly 3 realistic, delicious Kenyan meals. Return ONLY a JSON array of 3 meal objects.`;

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set. Using Kenyan home cooking fallback generator.');
      const fallbackMeals = generateFallbackKenyanMeals({
        ingredients,
        timeLimit,
        servings,
        cookingSetup,
        useExpiringSoon,
      });
      return res.json({ meals: fallbackMeals });
    }

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
        responseMimeType: 'application/json',
        responseSchema: {
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
                description: 'Swahili or local Kenyan name (e.g., Ugali na Sukuma Wiki, Wali wa Mchuzi).',
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
                description: 'Items from the user\'s list used in this recipe.',
              },
              ingredientsMissing: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key extra items needed that user may not have, if any.',
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
            ],
          },
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timeout after 9s')), 9000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text?.trim() || '';
    if (!text) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(text);
    const meals = Array.isArray(parsed) ? parsed.slice(0, 3) : (parsed.meals || []);

    if (meals.length === 0) {
      throw new Error('No meals returned in structure');
    }

    return res.json({ meals });
  } catch (error: any) {
    console.error('Error generating meals with Gemini API:', error);
    // Graceful fallback to guarantee the user gets realistic Kenyan suggestions
    try {
      const fallbackMeals = generateFallbackKenyanMeals(req.body);
      return res.json({
        meals: fallbackMeals,
        fallbackNote: 'Generated from Tupike local Kenyan kitchen guide while updating online connection.',
      });
    } catch (fallbackError) {
      return res.status(500).json({
        error: 'Pole sana! We had trouble creating the recipes right now. Please tap Retry.',
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
