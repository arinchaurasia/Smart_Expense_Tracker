/*
    Smart Expense Tracker
    Features: Add/Delete expenses, Monthly summary, Budget tracking, Gemini AI tips
    Storage: localStorage (browser)
*/


// ========================
//  Grabbing HTML Elements
// ========================

// Form inputs
var expenseName     = document.getElementById("expenseName");
var expenseAmount   = document.getElementById("expenseAmount");
var expenseCategory = document.getElementById("expenseCategory");
var addExpenseButton = document.getElementById("addExpenseButton");

// Display areas
var expenseList      = document.getElementById("expenseList");
var totalExpense     = document.getElementById("totalExpense");
var totalCount       = document.getElementById("totalCount");
var monthlyTotal     = document.getElementById("monthlyTotal");
var currentMonth     = document.getElementById("currentMonth");
var categoryBreakdown = document.getElementById("categoryBreakdown");
var emptyMessage     = document.getElementById("emptyMessage");

// Filter
var filterCategory = document.getElementById("filterCategory");

// Budget
var monthlyBudget    = document.getElementById("monthlyBudget");
var saveBudgetButton = document.getElementById("saveBudgetButton");
var budgetProgress   = document.getElementById("budgetProgress");
var budgetSpent      = document.getElementById("budgetSpent");
var budgetRemaining  = document.getElementById("budgetRemaining");
var progressBarFill  = document.getElementById("progressBarFill");
var budgetPercentage = document.getElementById("budgetPercentage");

// Gemini AI
var geminiApiKey     = document.getElementById("geminiApiKey");
var saveApiKeyButton = document.getElementById("saveApiKeyButton");
var getAiTipsButton  = document.getElementById("getAiTipsButton");
var spendingTips     = document.getElementById("spendingTips");


// ========================
//  App Data
// ========================

var allExpenses = [];

var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var categoryColors = {
    "Food":          "#e74c3c",
    "Transport":     "#3498db",
    "Shopping":      "#9b59b6",
    "Education":     "#27ae60",
    "Entertainment": "#f39c12",
    "Bills":         "#1abc9c",
    "Other":         "#95a5a6"
};


// ========================
//  Event Listeners
// ========================

addExpenseButton.addEventListener("click", addExpense);
filterCategory.addEventListener("change", filterExpenses);
saveBudgetButton.addEventListener("click", saveBudget);
saveApiKeyButton.addEventListener("click", saveApiKey);
getAiTipsButton.addEventListener("click", getAiTips);


// ========================
//  Load saved data on page open
// ========================

loadExpenses();
loadBudget();
loadApiKey();


// ========================
//  Storage Functions
// ========================

function loadExpenses() {
    var saved = localStorage.getItem("expenses");

    allExpenses = saved ? JSON.parse(saved) : [];

    filterCategory.value = "All";
    displayExpenses(allExpenses);
    updateMonthlySummary();
    updateBudgetProgress();
}

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(allExpenses));
}

function loadBudget() {
    var saved = localStorage.getItem("monthlyBudget");
    if (saved) {
        monthlyBudget.value = saved;
    }
}

function saveBudget() {
    var budget = Number(monthlyBudget.value);

    if (budget <= 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    localStorage.setItem("monthlyBudget", budget);
    alert("Budget saved! ₹" + budget + " per month.");
    updateBudgetProgress();
}

function loadApiKey() {
    var saved = localStorage.getItem("geminiApiKey");
    if (saved) {
        geminiApiKey.value = saved;
    }
}

function saveApiKey() {
    var key = geminiApiKey.value.trim();

    if (!key) {
        alert("Please enter a valid API key.");
        return;
    }

    localStorage.setItem("geminiApiKey", key);
    alert("API key saved!");
}


// ========================
//  Add Expense
// ========================

function addExpense() {
    var name     = expenseName.value.trim();
    var amount   = Number(expenseAmount.value);
    var category = expenseCategory.value;

    // Check all fields are filled
    if (!name || amount <= 0 || !category) {
        alert("Please fill all fields with valid values.");
        return;
    }

    var now = new Date();

    // Create expense object and add to array
    var newExpense = {
        id:       Date.now(),
        name:     name,
        amount:   amount,
        category: category,
        date:     now.toLocaleDateString(),
        month:    now.getMonth(),
        year:     now.getFullYear()
    };

    allExpenses.push(newExpense);
    saveExpenses();

    // Clear form
    expenseName.value     = "";
    expenseAmount.value   = "";
    expenseCategory.value = "";

    // Refresh UI
    filterCategory.value = "All";
    displayExpenses(allExpenses);
    updateMonthlySummary();
    updateBudgetProgress();
}


// ========================
//  Delete Expense
// ========================

function deleteExpense(id) {
    if (!confirm("Delete this expense?")) {
        return;
    }

    // Keep everything except the one we want to delete
    var updated = [];
    for (var i = 0; i < allExpenses.length; i++) {
        if (allExpenses[i].id !== id) {
            updated.push(allExpenses[i]);
        }
    }

    allExpenses = updated;
    saveExpenses();

    // Refresh UI
    filterCategory.value = "All";
    displayExpenses(allExpenses);
    updateMonthlySummary();
    updateBudgetProgress();
}


// ========================
//  Filter by Category
// ========================

function filterExpenses() {
    var selected = filterCategory.value;

    if (selected === "All") {
        displayExpenses(allExpenses);
        return;
    }

    var filtered = [];
    for (var i = 0; i < allExpenses.length; i++) {
        if (allExpenses[i].category === selected) {
            filtered.push(allExpenses[i]);
        }
    }

    displayExpenses(filtered);
}


// ========================
//  Display Expense List
// ========================

function displayExpenses(expenses) {
    expenseList.innerHTML = "";

    // Calculate total
    var total = 0;
    for (var i = 0; i < expenses.length; i++) {
        total += expenses[i].amount;
    }

    // Update summary numbers
    totalExpense.innerText = "₹" + total;
    totalCount.innerText   = expenses.length;

    // Toggle empty message
    emptyMessage.style.display = (expenses.length === 0) ? "block" : "none";

    // Create a card for each expense
    for (var i = 0; i < expenses.length; i++) {
        createExpenseCard(expenses[i]);
    }
}


// ========================
//  Create Single Expense Card
// ========================

function createExpenseCard(expense) {

    // Main row
    var item = document.createElement("div");
    item.className = "expense-item";

    // Left side — name & details
    var info = document.createElement("div");
    info.className = "expense-info";

    var name = document.createElement("h3");
    name.innerText = expense.name;

    var details = document.createElement("p");
    details.innerHTML = '<span class="category-badge">' + expense.category + '</span>' + expense.date;

    info.appendChild(name);
    info.appendChild(details);

    // Right side — amount & delete
    var right = document.createElement("div");
    right.className = "expense-right";

    var amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.innerText = "₹" + expense.amount;

    var delBtn = document.createElement("button");
    delBtn.innerText = "Delete";
    delBtn.className = "delete-button";

    // We wrap in a self-calling function to lock in the correct ID
    delBtn.addEventListener("click", (function(id) {
        return function() {
            deleteExpense(id);
        };
    })(expense.id));

    right.appendChild(amount);
    right.appendChild(delBtn);

    // Put it all together
    item.appendChild(info);
    item.appendChild(right);
    expenseList.appendChild(item);
}


// ========================
//  Helper: Get This Month's Expenses
// ========================

function getCurrentMonthExpenses() {
    var now = new Date();
    var thisMonth = now.getMonth();
    var thisYear  = now.getFullYear();
    var result    = [];

    for (var i = 0; i < allExpenses.length; i++) {
        if (allExpenses[i].month === thisMonth && allExpenses[i].year === thisYear) {
            result.push(allExpenses[i]);
        }
    }

    return result;
}


// ========================
//  Helper: Get Category Totals
// ========================

function getCategoryTotals(expenses) {
    var totals = {};

    for (var i = 0; i < expenses.length; i++) {
        var cat = expenses[i].category;
        totals[cat] = (totals[cat] || 0) + expenses[i].amount;
    }

    return totals;
}


// ========================
//  Monthly Summary
// ========================

function updateMonthlySummary() {
    var now = new Date();
    currentMonth.innerText = monthNames[now.getMonth()] + " " + now.getFullYear();

    var monthExpenses = getCurrentMonthExpenses();

    // Calculate month total
    var monthTotal = 0;
    for (var i = 0; i < monthExpenses.length; i++) {
        monthTotal += monthExpenses[i].amount;
    }
    monthlyTotal.innerText = "₹" + monthTotal;

    // No expenses? Show empty message
    if (monthExpenses.length === 0) {
        categoryBreakdown.innerHTML = '<p class="empty-message">No expenses this month yet.</p>';
        return;
    }

    // Build category-wise bars
    var catTotals  = getCategoryTotals(monthExpenses);
    var categories = Object.keys(catTotals);
    var html = "";

    for (var i = 0; i < categories.length; i++) {
        var catName   = categories[i];
        var catAmount = catTotals[catName];
        var percent   = Math.round((catAmount / monthTotal) * 100);
        var color     = categoryColors[catName] || "#667eea";

        html += '<div class="category-row">'
             +    '<div style="flex: 1;">'
             +      '<div style="display: flex; justify-content: space-between;">'
             +        '<span class="category-name">' + catName + '</span>'
             +        '<div class="category-details">'
             +          '<span class="category-amount">₹' + catAmount + '</span> '
             +          '<span class="category-percent">(' + percent + '%)</span>'
             +        '</div>'
             +      '</div>'
             +      '<div class="category-bar-bg">'
             +        '<div class="category-bar-fill" style="width: ' + percent + '%; background: ' + color + ';"></div>'
             +      '</div>'
             +    '</div>'
             + '</div>';
    }

    categoryBreakdown.innerHTML = html;
}


// ========================
//  Budget Progress Bar
// ========================

function updateBudgetProgress() {
    var budget = Number(localStorage.getItem("monthlyBudget"));

    // No budget set? Hide the progress bar
    if (!budget || budget <= 0) {
        budgetProgress.style.display = "none";
        return;
    }

    // Calculate how much spent this month
    var monthExpenses = getCurrentMonthExpenses();
    var spent = 0;
    for (var i = 0; i < monthExpenses.length; i++) {
        spent += monthExpenses[i].amount;
    }

    var remaining = budget - spent;
    var percent   = Math.round((spent / budget) * 100);

    // Show progress section
    budgetProgress.style.display = "block";
    budgetSpent.innerText = "₹" + spent + " spent";

    // Remaining or over budget text
    if (remaining >= 0) {
        budgetRemaining.innerText = "₹" + remaining + " remaining";
        budgetRemaining.style.color = "#27ae60";
    } else {
        budgetRemaining.innerText = "₹" + Math.abs(remaining) + " over budget!";
        budgetRemaining.style.color = "#e74c3c";
    }

    // Progress bar width (max 100% visually)
    progressBarFill.style.width = Math.min(percent, 100) + "%";
    progressBarFill.className = "progress-bar-fill";

    // Color and text based on usage
    if (percent > 100) {
        progressBarFill.classList.add("over-budget");
        budgetPercentage.innerText = "⚠️ " + percent + "% used — Over budget!";
    } else if (percent > 75) {
        progressBarFill.classList.add("warning");
        budgetPercentage.innerText = "⚠️ " + percent + "% used — Be careful!";
    } else {
        budgetPercentage.innerText = "✅ " + percent + "% used — On track!";
    }
}


// ========================
//  Gemini AI — Build Prompt
// ========================

function buildPrompt() {
    var monthExpenses = getCurrentMonthExpenses();
    var budget = Number(localStorage.getItem("monthlyBudget")) || 0;

    // Monthly total
    var monthTotal = 0;
    for (var i = 0; i < monthExpenses.length; i++) {
        monthTotal += monthExpenses[i].amount;
    }

    // Category breakdown
    var catTotals  = getCategoryTotals(monthExpenses);
    var categories = Object.keys(catTotals);

    // Days left in month
    var now        = new Date();
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var daysLeft   = daysInMonth - now.getDate();

    // Build the prompt string
    var prompt = "You are a personal finance advisor. Analyze my monthly expenses and give me a smart spending plan.\n\n"
        + "Month: " + monthNames[now.getMonth()] + " " + now.getFullYear() + "\n"
        + "Days left in month: " + daysLeft + "\n"
        + "Monthly Budget: ₹" + (budget > 0 ? budget : "Not set") + "\n"
        + "Total Spent: ₹" + monthTotal + "\n\n"
        + "Category-wise breakdown:\n";

    for (var i = 0; i < categories.length; i++) {
        prompt += "- " + categories[i] + ": ₹" + catTotals[categories[i]] + "\n";
    }

    prompt += "\nBased on this data, provide:\n"
        + "1. A brief analysis of my spending pattern (2 lines)\n"
        + "2. 3 specific actionable tips to save money\n"
        + "3. A suggested daily spending limit for the rest of the month\n"
        + "4. One motivational line about saving\n\n"
        + "Keep the response short, friendly and use ₹ for currency. Use emojis.";

    return prompt;
}


// ========================
//  Gemini AI — Get Tips
// ========================

async function getAiTips() {
    var apiKey = localStorage.getItem("geminiApiKey");

    if (!apiKey) {
        alert("Please enter and save your Gemini API key first.");
        return;
    }

    var monthExpenses = getCurrentMonthExpenses();

    if (monthExpenses.length === 0) {
        spendingTips.innerHTML = '<div class="tip-card">Add some expenses first to get AI-powered advice!</div>';
        return;
    }

    // Show loading state
    getAiTipsButton.disabled = true;
    getAiTipsButton.innerText = "Analyzing...";
    spendingTips.innerHTML = '<div class="ai-loading"><span class="spinner"></span>Gemini is analyzing your expenses...</div>';

    // Prepare API request
    var prompt = buildPrompt();
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

    var requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ]
    };

    try {
        // Call Gemini API
        var response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        var data = await response.json();

        // Handle API errors
        if (!response.ok) {
            var errorMsg = (data.error && data.error.message)
                ? data.error.message
                : "API request failed.";

            spendingTips.innerHTML = '<div class="ai-error">❌ ' + errorMsg + '</div>';
            resetAiButton();
            return;
        }

        // Show AI response
        var aiText = data.candidates[0].content.parts[0].text;
        spendingTips.innerHTML = '<div class="tip-card">' + formatAiResponse(aiText) + '</div>';

    } catch (error) {
        console.log("Gemini API error:", error);
        spendingTips.innerHTML = '<div class="ai-error">❌ Failed to connect. Check your API key and internet.</div>';
    }

    resetAiButton();
}

function resetAiButton() {
    getAiTipsButton.disabled = false;
    getAiTipsButton.innerText = "✨ Get AI Advice";
}


// ========================
//  Format Gemini Response
// ========================

function formatAiResponse(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/###\s?(.*)/g, "<strong>$1</strong>");
    text = text.replace(/##\s?(.*)/g, "<strong>$1</strong>");
    text = text.replace(/\n/g, "<br>");
    return text;
}