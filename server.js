const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000; // Use Render's port or default to 3000 locally

const healthyRecipes = [
    { id: 11, name: 'Chickpea Masala', ingredients: ['Unsalted butter', 'yellow onion', 'kosher salt', 'tomato paste', 'serrano chile', 'ginger', 'chickpeas', 'baking soda', 'garam masala', 'ground cumin', 'Kashmiri chili powder', 'heavy cream', 'dried fenugreek leaves', 'fresh cilantro', 'jasmine rice', 'naan'], link: 'https://www.delish.com/cooking/a45877598/indian-butter-chickpeas-recipe/' },
    { id: 12, name: 'Chicken-Zucchini Meatballs with Feta', ingredients: ['Zucchini', 'kosher salt', 'black pepper', 'shallot', 'panko', 'ground cumin', 'red-pepper flakes', 'ground chicken or turkey', 'fresh mint', 'basil', 'parsley', 'dill', 'extra-virgin olive oil', 'lemon juice', 'feta', 'spaghetti'], link: 'https://cooking.nytimes.com/recipes/1021328-chicken-zucchini-meatballs-with-feta?algo=identity&fellback=true&imp_id=3667128459165467&req_id=5797530591373341&surface=cooking-search-web&variant=0_relevance_reranking' },
    { id: 13, name: 'Cobb Salad', ingredients: ['Shallot', 'red-wine vinegar', 'kosher salt', 'ground pepper', 'whole grain or Dijon mustard', 'olive oil', 'eggs', 'thick-cut bacon', 'boneless, skinless chicken breast', 'romaine lettuce', 'tomatoes', 'avocado', 'blue cheese', 'chives'], link: 'https://cooking.nytimes.com/recipes/1018890-cobb-salad' },
    { id: 14, name: 'Parmesan-Crusted Chicken', ingredients: ['Boneless, skinless chicken breasts', 'kosher salt', 'black pepper', 'panko bread crumbs', 'grated Parmesan', 'fresh parsley', 'extra-virgin olive oil', 'mayonnaise', 'lemon wedges'], link: 'https://cooking.nytimes.com/recipes/1025525-parmesan-crusted-chicken' },
    { id: 15, name: 'Chicken Primavera Spaghetti Squash', ingredients: ['Spaghetti squash', 'extra-virgin olive oil', 'kosher salt', 'black pepper', 'red onion', 'orange bell pepper', 'grape tomatoes', 'zucchini', 'garlic', 'lemon zest', 'Italian seasoning', 'cooked shredded chicken', 'shredded mozzarella', 'freshly grated Parmesan', 'fresh parsley'], link: 'https://www.delish.com/cooking/recipe-ideas/a21084383/chicken-primavera-spaghetti-squash-boats-recipe/' },
    { id: 16, name: 'Artichoke Stuffed Chicken Breasts', ingredients: ['Chicken breasts', 'marinated artichoke hearts', 'red onion', 'shredded mozzarella cheese', 'parmesan cheese', 'garlic powder', 'lemon-pepper seasoning', 'dried basil', 'Italian seasoning'], link: 'https://www.food.com/amp/recipe/artichoke-stuffed-chicken-breasts-350909' },
    { id: 17, name: 'Grilled Vegetables with Quinoa and Burrata', ingredients: ['Parsley leaves', 'chives', 'garlic', 'extra-virgin olive oil', 'red wine vinegar', 'kosher salt', 'eggplant', 'zucchini', 'red peppers', 'asparagus', 'cherry tomatoes', 'olive oil', 'crusty bread', 'burrata cheese'], link: 'https://www.theoriginaldish.com/2020/06/23/grilled-vegetables-with-chimichurri-burrata/' },
    { id: 18, name: 'Burrito Bowl', ingredients: ['Cilantro Lime Rice', 'black beans', 'Tofu Sofritas', 'Fajita Veggies', 'Pico de Gallo', 'Guacamole', 'sea salt', 'freshly ground black pepper', 'lime wedges'], link: 'https://www.loveandlemons.com/burrito-bowl/' }
];

const stapleItems = [
    'raspberries',
    'half & half',
    'bananas',
    'coffee',
    'eggs'
];

const ingredientCategories = {
    // Produce
    'raspberries': 'Produce',
    'bananas': 'Produce',
    'yellow onion': 'Produce',
    'serrano chile': 'Produce',
    'ginger': 'Produce',
    'fresh cilantro': 'Produce',
    'zucchini': 'Produce',
    'shallot': 'Produce',
    'fresh mint': 'Produce',
    'basil': 'Produce',
    'parsley': 'Produce',
    'dill': 'Produce',
    'lemon juice': 'Produce',
    'romaine lettuce': 'Produce',
    'tomatoes': 'Produce',
    'avocado': 'Produce',
    'chives': 'Produce',
    'lemon wedges': 'Produce',
    'red onion': 'Produce',
    'orange bell pepper': 'Produce',
    'grape tomatoes': 'Produce',
    'garlic': 'Produce',
    'lemon zest': 'Produce',
    'eggplant': 'Produce',
    'red peppers': 'Produce',
    'asparagus': 'Produce',
    'cherry tomatoes': 'Produce',
    'lime wedges': 'Produce',
    'broccoli': 'Produce',
    'bell peppers': 'Produce',
    'lime': 'Produce',
    'carrots': 'Produce',
    'snap peas': 'Produce',
    'spinach': 'Produce',
    'cucumber': 'Produce',
    'cabbage slaw': 'Produce',
    'corn': 'Produce',
    'spaghetti squash': 'Produce',
    'fresh parsley': 'Produce',
    'parsley leaves': 'Produce',

    // Refrigerated
    'half & half': 'Refrigerated',
    'eggs': 'Refrigerated',
    'unsalted butter': 'Refrigerated',
    'heavy cream': 'Refrigerated',
    'feta': 'Refrigerated',
    'blue cheese': 'Refrigerated',
    'mayonnaise': 'Refrigerated',
    'shredded mozzarella': 'Refrigerated',
    'shredded mozzarella cheese': 'Refrigerated',
    'burrata cheese': 'Refrigerated',
    'shrimp': 'Refrigerated',
    'salmon fillet': 'Refrigerated',
    'ground turkey': 'Refrigerated',
    'ground beef': 'Refrigerated',
    'marinated artichoke hearts': 'Refrigerated',
    'boneless, skinless chicken breasts': 'Refrigerated',
    'boneless, skinless chicken breast': 'Refrigerated',
    'cooked shredded chicken': 'Refrigerated',
    'freshly grated parmesan': 'Refrigerated',
    'ground chicken or turkey': 'Refrigerated',

    // Pantry / Unrefrigerated
    'kosher salt': 'Pantry',
    'black pepper': 'Pantry',
    'tomato paste': 'Pantry',
    'chickpeas': 'Pantry',
    'baking soda': 'Pantry',
    'garam masala': 'Pantry',
    'ground cumin': 'Pantry',
    'kashmiri chili powder': 'Pantry',
    'dried fenugreek leaves': 'Pantry',
    'jasmine rice': 'Pantry',
    'naan': 'Pantry',
    'panko': 'Pantry',
    'red-pepper flakes': 'Pantry',
    'spaghetti': 'Pantry',
    'whole grain or dijon mustard': 'Pantry',
    'olive oil': 'Pantry',
    'thick-cut bacon': 'Pantry',
    'panko bread crumbs': 'Pantry',
    'grated parmesan': 'Pantry',
    'extra-virgin olive oil': 'Pantry',
    'italian seasoning': 'Pantry',
    'garlic powder': 'Pantry',
    'lemon-pepper seasoning': 'Pantry',
    'dried basil': 'Pantry',
    'crusty bread': 'Pantry',
    'cilantro lime rice': 'Pantry',
    'black beans': 'Pantry',
    'tofu sofritas': 'Pantry',
    'fajita veggies': 'Pantry',
    'pico de gallo': 'Pantry',
    'guacamole': 'Pantry',
    'sea salt': 'Pantry',
    'coffee': 'Pantry',
    'quinoa': 'Pantry',
    'lentils': 'Pantry',
    'vegetable broth': 'Pantry',
    'sweet potato': 'Pantry',
    'oats': 'Pantry',
    'spices': 'Pantry',
    'bun': 'Pantry',
    'soy sauce': 'Pantry',
    'coconut milk': 'Pantry',
    'curry powder': 'Pantry',
    'rice noodles': 'Pantry',
    'chili powder': 'Pantry',
    'cumin': 'Pantry',
    'tortillas': 'Pantry',
    'freshly ground black pepper': 'Pantry',
    'ground pepper': 'Pantry',
    'red wine vinegar': 'Pantry',
    'red-wine vinegar': 'Pantry'
};

// NEW: getWeeklyRecipes now accepts a numDays parameter
function getWeeklyRecipes(numDays = 7) { // Default to 7 if not provided
  const shuffled = healthyRecipes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(numDays, shuffled.length)); // Slice by numDays
}

app.use(express.static(path.join(__dirname, 'public')));

// NEW: /api/weekly-recipes now reads 'days' query parameter
app.get('/api/weekly-recipes', (req, res) => {
  const numDays = parseInt(req.query.days); // Get 'days' from query string, convert to integer
  // Debug log for numDays parameter on server side
  console.log('Server: Received numDays parameter from query:', req.query.days, 'Parsed as integer:', numDays);
  const weeklySelection = getWeeklyRecipes(numDays); // Pass numDays to function
  res.json(weeklySelection);
});

// API endpoint to get the grocery list for the current weekly recipes
app.post('/api/grocery-list', express.json(), (req, res) => {
  const { recipes, adHocItems } = req.body;

  // These debug logs can be removed once confident everything is working
  // console.log('Recipes after destructuring:', recipes);
  // console.log('Is recipes an array (Array.isArray(recipes))?', Array.isArray(recipes));

  if (!recipes || !Array.isArray(recipes)) {
      // console.log('Validation failed: Recipes is invalid or missing.'); // Debug log
      return res.status(400).json({ error: 'Invalid or missing recipes in request body.' });
  }

  const groceryListMap = new Map();

  // Add built-in staple items to the map first
  stapleItems.forEach(item => {
    const normalizedItem = item.trim().toLowerCase();
    groceryListMap.set(normalizedItem, (groceryListMap.get(normalizedItem) || 0) + 1);
  });

  // Add ad-hoc items from the client to the map, using their provided category
  if (adHocItems && Array.isArray(adHocItems)) {
      adHocItems.forEach(adHocItem => {
          if (adHocItem.name) {
              const normalizedItem = adHocItem.name.trim().toLowerCase();
              groceryListMap.set(normalizedItem, (groceryListMap.get(normalizedItem) || 0) + 1);
              if (!ingredientCategories[normalizedItem]) {
                  ingredientCategories[normalizedItem] = adHocItem.category || 'Other';
              }
          }
      });
  }

  // Add ingredients from selected recipes
  recipes.forEach(recipe => {
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ingredient => {
          const normalizedIngredient = ingredient.trim().toLowerCase();
          groceryListMap.set(normalizedIngredient, (groceryListMap.get(normalizedIngredient) || 0) + 1);
        });
    }
  });

  const categorizedGroceryList = {
    'Produce': [],
    'Refrigerated': [],
    'Pantry': [],
    'Other': []
  };

  Array.from(groceryListMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([ingredient, count]) => {
      const formattedItem = count > 1 ? `<span class="math-inline">\{ingredient\} \(x</span>{count})` : ingredient;
      const category = ingredientCategories[ingredient] || 'Other';

      if (!categorizedGroceryList[category]) {
          categorizedGroceryList[category] = [];
      }
      categorizedGroceryList[category].push(formattedItem);
    });

  res.json(categorizedGroceryList);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});