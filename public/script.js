let currentWeeklyRecipes = [];
let adHocGroceryItems = []; // Global variable to store ad-hoc items

document.addEventListener('DOMContentLoaded', () => {
    const recipeListDiv = document.getElementById('recipe-list');
    const generateGroceryListBtn = document.getElementById('generate-grocery-list-btn');
    const groceryListDisplay = document.getElementById('grocery-list-display');
    // NOTE: groceryItemsUl is no longer directly used for rendering categories

    // Elements for the replace recipe form
    const replaceRecipeForm = document.getElementById('replace-recipe-form');
    const newRecipeTitleInput = document.getElementById('newRecipeTitle');
    const newRecipeIngredientsInput = document.getElementById('newRecipeIngredients');
    const newRecipeLinkInput = document.getElementById('newRecipeLink');
    const replaceDaySelect = document.getElementById('replaceDaySelect');

    // Elements for ad-hoc item form
    const addAdHocForm = document.getElementById('add-ad-hoc-form'); // This line gets the form element
    const adHocItemInput = document.getElementById('adHocItemInput');
    const adHocCategorySelect = document.getElementById('adHocCategorySelect');
    const displayAdHocItemsDiv = document.getElementById('display-ad-hoc-items');


    async function fetchWeeklyRecipes() {
        try {
            recipeListDiv.innerHTML = '<p>Loading your weekly dinner ideas...</p>';
            const response = await fetch('/api/weekly-recipes');
            const recipes = await response.json();

            if (!Array.isArray(recipes) || recipes.length === 0) {
                recipeListDiv.innerHTML = '<p>No recipes found this week. Please check the server.</p>';
                return;
            }

            currentWeeklyRecipes = recipes; // Store the fetched recipes globally
            renderRecipes(recipes); // Call a new function to render
            
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeListDiv.innerHTML = '<p>Oops! Could not load recipes. Please try again later.</p>';
        }
    }

    function renderRecipes(recipesToRender) {
        recipeListDiv.innerHTML = ''; // Clear loading message and existing recipes

        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        recipesToRender.forEach((recipe, index) => {
            const day = daysOfWeek[index % daysOfWeek.length];
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';

            recipeCard.innerHTML = `
                <h2>${day}'s Dinner Idea</h2>
                <h3>${recipe.name}</h3>
                <p><strong>Main Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
                <a href="${recipe.link}" target="_blank">View Recipe Details</a>
            `;
            recipeListDiv.appendChild(recipeCard);
        });
    }

    // Function to render ad-hoc items
    function renderAdHocItems() {
        displayAdHocItemsDiv.innerHTML = ''; // Clear existing display
        if (adHocGroceryItems.length === 0) {
            displayAdHocItemsDiv.innerHTML = '<p>No extra items added yet.</p>';
            return;
        }

        const ul = document.createElement('ul');
        adHocGroceryItems.forEach((item, index) => { // 'item' is now { name: '...', category: '...' }
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.className = 'ad-hoc-item-display';
            span.textContent = `${item.name} (${item.category})`; // Display name and category
            span.dataset.index = index; // Store index for potential removal

            li.appendChild(span);
            ul.appendChild(li);
        });
        displayAdHocItemsDiv.appendChild(ul);
    }

    async function fetchGroceryList() {
        try {
            groceryListDisplay.innerHTML = '<h2>Your Weekly Grocery List</h2><p>Generating list...</p>';
            groceryListDisplay.style.display = 'block';

            // Send both currentWeeklyRecipes and adHocGroceryItems to the server
            const response = await fetch('/api/grocery-list', {
                method: 'POST', // Server-side expects a POST request now
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipes: currentWeeklyRecipes,
                    adHocItems: adHocGroceryItems // Include ad-hoc items as array of objects
                })
            });
            const groceryList = await response.json();

            // Re-render the grocery list display area with categories
            groceryListDisplay.innerHTML = '<h2>Your Weekly Grocery List</h2>';

            let hasContent = false;
            for (const category in groceryList) {
                const items = groceryList[category];
                if (Array.isArray(items) && items.length > 0) {
                    hasContent = true; // Mark that we have content to display
                    const categoryDiv = document.createElement('div');
                    categoryDiv.className = 'grocery-category';

                    const categoryHeading = document.createElement('h3');
                    categoryHeading.textContent = category;
                    categoryDiv.appendChild(categoryHeading);

                    const ul = document.createElement('ul');
                    items.forEach(item => {
                        const listItem = document.createElement('li');
                        listItem.textContent = item;
                        listItem.classList.add('grocery-item-removable'); // NEW: Add this class!
                        ul.appendChild(listItem);
                    });
                    categoryDiv.appendChild(ul);
                    groceryListDisplay.appendChild(categoryDiv);
                }
            }
            
            if (!hasContent) { // If no categories had items
                 groceryListDisplay.innerHTML += '<p>No ingredients found for this week.</p>';
            }


        } catch (error) {
            console.error('Error fetching grocery list:', error);
            groceryListDisplay.innerHTML = '<h2>Your Weekly Grocery List</h2><p>Oops! Could not generate grocery list.</p>';
        }
    }

    // Function to handle recipe replacement
    function handleRecipeReplacement(event) {
        event.preventDefault(); // Prevent the form from reloading the page

        const newRecipeTitle = newRecipeTitleInput.value;
        const newRecipeIngredients = newRecipeIngredientsInput.value;
        const newRecipeLink = newRecipeLinkInput.value;
        const replaceIndex = parseInt(replaceDaySelect.value); // Get the index (0-6) of the day to replace

        // Basic validation
        if (!newRecipeTitle || !newRecipeIngredients || !newRecipeLink) {
            alert('Please fill in all fields for the new recipe.');
            return;
        }

        // Convert comma-separated ingredients string to an array, trim whitespace
        const ingredientsArray = newRecipeIngredients.split(',').map(item => item.trim());

        // Create a new recipe object (assign a temporary ID)
        const newRecipe = {
            id: Date.now(), // Unique ID based on timestamp
            name: newRecipeTitle,
            ingredients: ingredientsArray,
            link: newRecipeLink
        };

        // Replace the recipe in our local array
        if (replaceIndex >= 0 && replaceIndex < currentWeeklyRecipes.length) {
            currentWeeklyRecipes[replaceIndex] = newRecipe;
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // Define here for alert
            renderRecipes(currentWeeklyRecipes); // Re-render the recipes to show the change
            alert(`Successfully replaced recipe for ${daysOfWeek[replaceIndex]}!`);

            // Optionally, clear the form
            replaceRecipeForm.reset();
        } else {
            alert('Invalid day selected for replacement.');
        }
    }

    // Function to handle adding ad-hoc items
    function handleAddAdHocItem(event) {
        event.preventDefault(); // Prevent form submission (page reload)

        const itemText = adHocItemInput.value.trim();
        const itemCategory = adHocCategorySelect.value; // Get selected category

        if (itemText) {
            // Store item as an object with its name and category
            adHocGroceryItems.push({ name: itemText, category: itemCategory });
            renderAdHocItems(); // Update the displayed list of ad-hoc items
            adHocItemInput.value = ''; // Clear the input field
        }
    }


    // Event Listeners
    generateGroceryListBtn.addEventListener('click', fetchGroceryList);
    replaceRecipeForm.addEventListener('submit', handleRecipeReplacement);
    addAdHocForm.addEventListener('submit', handleAddAdHocItem); // Listen for ad-hoc form submission

    // NEW: Event Listener for grocery item deletion (using event delegation)
    groceryListDisplay.addEventListener('click', (event) => {
        // Check if the clicked element has the 'grocery-item-removable' class
        if (event.target.classList.contains('grocery-item-removable')) {
            event.target.remove(); // Remove the clicked list item from the DOM
        }
    });

    // Initial fetch of recipes when the page loads
    fetchWeeklyRecipes();
    renderAdHocItems(); // Call this to ensure ad-hoc list is rendered even if empty initially
});