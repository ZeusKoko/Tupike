# 🍲 Tupike? — What Should I Cook?

> **"Chakula gani leo?"** — A mobile-first web application designed for Kenyan households to transform whatever ingredients you have in your kitchen into three delicious, practical home-cooked meals.

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-3.8_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## 📖 Overview

Most people face the daily question: *"What should I cook today?"* In Kenya, homes frequently have varied staples on hand—greens like *sukuma wiki*, some *nyanya*, maize flour (*unga*), boiled *githeri*, or *ndengu*—but it can be tiring to figure out how to bring them together into a satisfying meal.

**Tupike?** (*Swahili for "What should we cook?"*) is tailored specifically for everyday Kenyan kitchens:
- **Phone-first & Lightweight**: Fast loading on cellular data connections with zero heavy assets.
- **Realistic Kitchen Setups**: Designed around 1 or 2 burners or a *jiko* (charcoal stove), with no oven needed.
- **Bilingual & Intuitive**: Understands both English and common Swahili food names.
- **Staples Assumed**: Automatically factors in household basics like salt (*chumvi*), cooking oil (*mafuta*), water, onions (*vitunguu*), and basic spices.
- **Zero Login Friction**: Save favorite recipes to browser `localStorage` without creating an account or giving personal data.

---

## 🎨 Design System & Palette

Tupike uses a distinct, warm, and appetizing color palette inspired by fresh Kenyan produce and golden grains:

| Color | Hex | Role in App |
|---|---|---|
| **Forest Green** | `#25671E` | Header banner, headings, primary buttons, selected card states |
| **Vibrant Green** | `#48A111` | Accents, tick marks, active chips, progress highlights |
| **Golden Yellow** | `#F2B50B` | "What can I cook?" CTA button, saved heart icon, highlight badges |
| **Soft Off-White** | `#F7F0F0` | Body and card backgrounds, ensuring gentle contrast |

> **Accessibility Rule**: High contrast is strictly maintained throughout the app. White text appears only on dark green backgrounds, and dark green text appears across light and yellow backgrounds.

---

## 📱 Screens & User Journey

### 1. Home / Ingredient Picker
- **Bilingual Search & Quick Add**: Type in English (*"tomatoes"*, *"kale"*, *"fish"*) or Swahili (*"nyanya"*, *"sukuma wiki"*, *"ngege"*, *"waru"*, *"unga"*).
- **Custom Ingredients**: If an ingredient is not in the list, tap **Add** to include any custom item.
- **Visual Tap Grid**: Tap rounded food cards with emoji icons categorized into:
  - **🥬 Vegetables**: Sukuma wiki, spinach, cabbage, tomatoes, onions, carrots, Irish potatoes (*waru*), sweet potatoes (*ngwaci*), peas (*minji*), green peppers (*hoho*), managu, terere, and pumpkin (*malenge*).
  - **🥩 Proteins**: Eggs (*mayai*), beef (*nyama ya ng'ombe*), chicken (*kuku*), tilapia, omena (*dagaa*), goat meat (*mbuzi*), beans (*maharagwe*), green grams (*ndengu*), black beans (*njahi*), minced meat, and sausages.
  - **🌾 Grains & Flour**: Rice (*mchele*), maize flour (*unga wa ugali*), wheat flour, chapati flour (*atta*), githeri, spaghetti, and bread.
  - **🥑 Fruit & Others**: Bananas (*matoke*), avocado (*parachichi*), coconut milk (*tui la nazi*), milk (*maziwa*), lemon (*ndimu*), arrow roots (*nduma*), and cassava (*muhogo*).
- **More Cooking Options (Filters)**:
  - Available preparation time: *Under 20 minutes*, *30 minutes*, *1 hour or more*, or *Any time*.
  - Servings: *1 to 6+ people*.
  - Kitchen setup: *One burner*, *Two burners*, *Jiko*, or *Has an oven*.
  - Toggle: *"Use up things that may go bad soon"* (prioritizes ripe produce).
- **Sticky Ingredients Bar**: Dynamic counter, chip list with quick `×` deletion, and a prominent golden **"What can I cook?"** button.

### 2. Suggested Meals Screen
- Generates **exactly 3 realistic meal options** via the server-side Gemini API with structured JSON output.
- Dynamic loading state with cycling messages (*"Checking your kitchen ingredients..."*, *"Balancing one or two burner steps..."*).
- Cards display:
  - English and Swahili names (e.g., *Ugali with Sautéed Greens & Quick Fried Eggs* / *Ugali, Sukuma Wiki na Mayai*).
  - Cooking time and serving yield.
  - Difficulty tag (*Easy* or *Medium*).
  - Ingredient match badge (*"You have everything!"* vs. *"Missing: [item]"*).
  - Instant favorite heart toggle.
- **"Try different suggestions"** button to regenerate fresh options immediately.

### 3. Step-by-Step Recipe Detail
- Full breakdown of preparation time, yield, and burner requirements.
- **Interactive Checklist**: Differentiates between what is already in your kitchen, pantry staples, and any extras.
- **Numbered Cooking Steps**: Clear, beginner-friendly instructions specifying safe internal doneness advice for meats, poultry, and fish.
- **Cook's Pro Tip**: Actionable home cooking advice (e.g., caramelizing onions for rich gravies, steaming ugali, peeling matoke without sap staining).

### 4. My Favorites
- Persisted locally in browser `localStorage` (`tupike_favorites_v1`).
- Works **100% offline** without triggering additional AI calls or consuming mobile data.
- Manage and remove recipes with one tap.
- Informative privacy note: *"Your favorites are saved on this phone and browser."*

---

## 🏗️ Architecture & Technology Stack

```
tupike/
├── index.html                   # HTML entry point with Nunito & Poppins typography
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependencies & scripts
├── server.ts                    # Express server with Gemini API endpoint & Vite middleware
├── src/
│   ├── main.tsx                 # React application root mount
│   ├── App.tsx                  # Screen controller & state coordinator
│   ├── index.css                # Tailwind CSS v4 directives & font styling
│   ├── types.ts                 # TypeScript data contracts & schemas
│   ├── data/
│   │   └── ingredients.ts       # Categorized Kenyan ingredients & aliases
│   ├── services/
│   │   ├── api.ts               # Client-side API fetch client
│   │   └── storage.ts           # LocalStorage favorites manager
│   └── components/
│       ├── Header.tsx           # Sticky brand banner & favorites badge
│       ├── BottomNav.tsx        # Mobile thumb navigation bar
│       ├── IngredientPicker.tsx # Search, custom add & category grid
│       ├── FilterOptionsModal.tsx # Burner, time & servings filters
│       ├── StickyIngredientBar.tsx# Floating ingredients drawer & CTA
│       ├── MealResults.tsx      # 3 AI meal suggestion cards
│       ├── RecipeDetail.tsx     # Full recipe with steps & tips
│       └── FavoritesList.tsx    # Saved recipes screen
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite bundler & Tailwind configuration
```

### Technology Highlights
- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend API**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **AI Engine**: `@google/genai` TypeScript SDK invoking **`gemini-3.8-flash`** with strict JSON schemas and low-latency thinking optimization (`ThinkingLevel.LOW`).
- **Resilient Fallback**: Includes a built-in catalog of authentic Kenyan home recipes ensuring users always receive relevant suggestions even on unstable cellular connections.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone or enter the project directory**:
   ```bash
   cd tupike
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-google-gemini-api-key"
   PORT=3000
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your mobile browser or emulator.

---

## 📡 API Reference

### `POST /api/suggest-meals`

Suggests 3 customized Kenyan dishes based on user ingredients and kitchen preferences.

#### Request Body
```json
{
  "ingredients": [
    "Sukuma Wiki (Kale)",
    "Tomatoes",
    "Eggs",
    "Maize Flour (Ugali)"
  ],
  "timeLimit": "30 minutes",
  "servings": 4,
  "cookingSetup": "One burner",
  "useExpiringSoon": false
}
```

#### Response Body
```json
{
  "meals": [
    {
      "name": "Ugali with Sautéed Greens & Quick Fried Eggs",
      "localName": "Ugali, Sukuma Wiki na Mayai",
      "description": "The beloved quintessential Kenyan comfort dinner, quick to whip up on a single burner.",
      "timeMinutes": 25,
      "servings": 4,
      "difficulty": "Easy",
      "ingredientsUserHas": ["Sukuma Wiki", "Tomatoes", "Eggs", "Maize Flour"],
      "ingredientsMissing": [],
      "ingredients": [
        "2 cups Maize flour (unga wa ugali)",
        "3 cups Water",
        "1 bunch Sukuma wiki, finely shredded",
        "3 Fresh eggs",
        "1 medium Onion, diced",
        "2 ripe Tomatoes, finely chopped",
        "2 tbsp Vegetable oil",
        "1 tsp Salt to taste"
      ],
      "steps": [
        "Greens: Heat 1 tbsp oil in a sufuria. Fry onions till translucent, add tomatoes and cook until soft. Add greens and salt, stir fry for 5 minutes, then cover off-heat.",
        "Eggs: In a small pan or the same pot, fry eggs sunny-side up or scramble with a pinch of salt.",
        "Ugali: Boil water in a sufuria. Add maize flour gradually while stirring with a wooden mwiko to prevent lumps. Press against pot sides until firm (7-10 minutes). Shape into a mound.",
        "Serve hot immediately with a slice of avocado."
      ],
      "tip": "Let your ugali steam covered on the lowest burner flame for 2 minutes before serving for an authentic aroma."
    }
  ]
}
```

---

## 🇰🇪 Kenyan Dishes Supported

Tupike is pre-tuned for East African home cooking, including:
- **Ugali na Sukuma Wiki / Spinach / Managu / Terere**
- **Special Fried Githeri** (Maize & beans with sweet carrots and avocado)
- **Beef & Chicken Wet Fry / Karanga** with thick tomato-onion gravy
- **Crispy Lake Victoria Tilapia** (Wet fry or coconut stew)
- **Pan-Fried Omena** in savory lemon-tomato sauce
- **Hearty Coconut Ndengu & Maharagwe** (Green grams & yellow beans)
- **Soft Layered Kenyan Chapatis**
- **Simmered Green Banana Stew** (*Matoke ya Nyama/Mboga*)
- **Boiled & Sautéed Indigenous Roots** (*Nduma, Ngwaci, Muhogo*)
- **Golden Pumpkin Stew** (*Malenge ya Kukaanga*)

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the source files for details.
