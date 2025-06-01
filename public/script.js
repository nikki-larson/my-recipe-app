let currentWeeklyRecipes = [];
let adHocGroceryItems = []; // Global variable to store ad-hoc items

document.addEventListener('DOMContentLoaded', () => {
    const recipeListDiv = document.getElementById('recipe-list');
    const generateGroceryListBtn = document.getElementById('generate-grocery-list-btn');
    const groceryListDisplay = document.getElementById('grocery-list-display');

    // Elements for the replace recipe form
    const replaceRecipeForm = document.getElementById('replace-recipe-form');
    const newRecipeTitleInput = document.getElementById('newRecipeTitle');
    const newRecipeIngredientsInput = document.getElementById('newRecipeIngredients');
    const newRecipeLinkInput = document.getElementById('newRecipeLink');
    const replaceDaySelect = document.getElementById('replaceDaySelect');

    // Elements for ad-hoc item form
    const addAdHocForm = document.getElementById('add-ad-hoc-form');
    const adHocItemInput = document.getElementById('adHocItemInput');
    const adHocCategorySelect = document.getElementById('adHocCategorySelect');
    const displayAdHocItemsDiv = document.getElementById('display-ad-hoc-items');

    // Elements for number of days selector
    const numDaysSelect = document.getElementById('numDaysSelect');
    const generateNewRecipesBtn = document.getElementById('generateNewRecipesBtn');


    async function fetchWeeklyRecipes() {
        try {
            recipeListDiv.innerHTML = '<p>Loading your weekly dinner ideas...</p>';
            // Get the selected number of days from the dropdown
            const numDays = numDaysSelect.value;
            // Debug log for numDays on client side
            console.log('Client: Selected number of days:', numDays); 
            // Send as query parameter
            const response = await fetch(`/api/weekly-recipes?days=${numDays}`); 
            const recipes = await response.json();

            if (!Array.isArray(recipes) || recipes.length === 0) {
                recipeListDiv.innerHTML = '<p>No recipes found this week. Please check the server.</p>';
                return;
            }

            currentWeeklyRecipes = recipes;
            renderRecipes(recipes);
            
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeListDiv.innerHTML = '<p>Oops! Could not load recipes. Please try again later.</p>';
        }
    }

    function renderRecipes(recipesToRender) {
        recipeListDiv.innerHTML = '';

        // Display correct number of days based on actual recipes fetched
        const daysOfWeek = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']; 

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

    function renderAdHocItems() {
        displayAdHocItemsDiv.innerHTML = '';
        if (adHocGroceryItems.length === 0) {
            displayAdHocItemsDiv.innerHTML = '<p>No extra items added yet.</p>';
            return;
        }

        const ul = document.createElement('ul');
        adHocGroceryItems.forEach((item, index) => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.className = 'ad-hoc-item-display';
            span.textContent = `${item.name} (${item.category})`;
            span.dataset.index = index;

            li.appendChild(span);
            ul.appendChild(li);
        });
        displayAdHocItemsDiv.appendChild(ul);
    }

    async function fetchGroceryList() {
        try {
            groceryListDisplay.innerHTML = '<h2>Your Weekly Grocery List</h2><p>Generating list...</p>';
            groceryListDisplay.style.display = 'block';

            const response = await fetch('/api/grocery-list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipes: currentWeeklyRecipes,
                    adHocItems: adHocGroceryItems
                })
            });
            const groceryList = await response.json();

            groceryListDisplay.innerHTML = '<h2>Your Weekly Grocery List</h2>';

            let hasContent = false;
            for (const category in groceryList) {
                const items = groceryList[category];
                if (Array.isArray(items) && items.length > 0) {
                    hasContent = true;
                    const categoryDiv = document.createElement('div');
                    categoryDiv.className = 'grocery-category';

                    const categoryHeading = document.createElement('h3');
                    categoryHeading.textContent = category;
                    categoryDiv.appendChild(categoryHeading);

                    const ul = document.createElement('ul');
                    items.forEach(item => {
                        const listItem = document.createElement('li');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.classList.add('grocery-item-checkbox');
                        
                        checkbox.addEventListener('change', (e) => {
                            if (e.target.checked) {
                                listItem.classList.add('grocery-item-checked');
                            } else {
                                listItem.classList.remove('grocery-item-checked');
                            }
                            e.stopPropagation();
                        });

                        listItem.appendChild(checkbox);
                        const itemTextNode = document.createTextNode(item);
                        listItem.appendChild(itemTextNode);
                        listItem.classList.add('grocery-item-removable'); 
                        ul.appendChild(listItem);
                    });
                    categoryDiv.appendChild(ul);
                    groceryListDisplay.appendChild(categoryDiv);
                }
            }
            
            if (!hasContent) {
                 groceryListDisplay.innerHTML += '<p>No ingredients found for this week.</p>';
            }


        } catch (error) {
            console.error('Error fetching grocery list:', error);
            groceryListDisplay.innerHTML = '<h2>Your Weekly Grocery List</h2><p>Oops! Could not generate grocery list.</p>';
        }
    }

    function handleRecipeReplacement(event) {
        event.preventDefault();

        const newRecipeTitle = newRecipeTitleInput.value;
        const newRecipeIngredients = newRecipeIngredientsInput.value;
        const newRecipeLink = newRecipeLinkInput.value;
        const replaceIndex = parseInt(replaceDaySelect.value);

        if (!newRecipeTitle || !newRecipeIngredients || !newRecipeLink) {
            alert('Please fill in all fields for the new recipe.');
            return;
        }

        const ingredientsArray = newRecipeIngredients.split(',').map(item => item.trim());

        const newRecipe = {
            id: Date.now(),
            name: newRecipeTitle,
            ingredients: ingredientsArray,
            link: newRecipeLink
        };

        if (replaceIndex >= 0 && replaceIndex < currentWeeklyRecipes.length) {
            if (replaceIndex < currentWeeklyRecipes.length) { // Ensure within bounds of current recipes
                currentWeeklyRecipes[replaceIndex] = newRecipe;
                const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                renderRecipes(currentWeeklyRecipes);
                alert(`Successfully replaced recipe for ${daysOfWeek[replaceIndex]}!`);
            } else {
                alert('Cannot replace a day beyond the current number of recipes displayed.');
            }
            replaceRecipeForm.reset();
        } else {
            alert('Invalid day selected for replacement.');
        }
    }

    function handleAddAdHocItem(event) {
        event.preventDefault();

        const itemText = adHocItemInput.value.trim();
        const itemCategory = adHocCategorySelect.value;

        if (itemText) {
            adHocGroceryItems.push({ name: itemText, category: itemCategory });
            renderAdHocItems();
            adHocItemInput.value = '';
        }
    }


    // Event Listeners
    generateGroceryListBtn.addEventListener('click', fetchGroceryList);
    replaceRecipeForm.addEventListener('submit', handleRecipeReplacement);
    addAdHocForm.addEventListener('submit', handleAddAdHocItem);
    groceryListDisplay.addEventListener('click', (event) => {
        if (event.target.classList.contains('grocery-item-removable') && event.target.tagName !== 'INPUT') {
            event.target.remove();
        }
    });

    // NEW: Event listener for Generate Recipes button
    generateNewRecipesBtn.addEventListener('click', fetchWeeklyRecipes);

    // Initial fetch of recipes when the page loads
    fetchWeeklyRecipes();
    renderAdHocItems();
});