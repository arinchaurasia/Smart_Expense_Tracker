// =========================================
//  Smart Expense Tracker — JavaScript
//  Uses localStorage + Gemini API
// =========================================

// --- DOM Elements ---
var expenseName = document.getElementById("expenseName");
var expenseAmount = document.getElementById("expenseAmount");
var expenseCategory = document.getElementById("expenseCategory");
var addExpenseButton = document.getElementById("addExpenseButton");
var expenseList = document.getElementById("expenseList");
var totalExpense = document.getElementById("totalExpense");
var totalCount = document.getElementById("totalCount");
var monthlyTotal = document.getElementById("monthlyTotal");
var currentMonth = document.getElementById("currentMonth");
var categoryBreakdown = document.getElementById("categoryBreakdown");
var filterCategory = document.getElementById("filterCategory");
var emptyMessage = document.getElementById("emptyMessage");
var monthlyBudget = document.getElementById("monthlyBudget");
var saveBudgetButton = document.getElementById("saveBudgetButton");
var budgetProgress = document.getElementById("budgetProgress");
var budgetSpent = document.getElementById("budgetSpent");
var budgetRemaining = document.getElementById("budgetRemaining");
var progressBarFill = document.getElementById("progressBarFill");
var budgetPercentage = document.getElementById("budgetPercentage");
var spendingTips = document.getElementById("spendingTips");
var geminiApiKey = document.getElementById("geminiApiKey");
var saveApiKeyButton = document.getElementById("saveApiKeyButton");
var getAiTipsButton = document.getElementById("getAiTipsButton");

// --- Data ---
var allExpenses = [];

// --- Month Names ---
var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// --- Category Colors ---
var categoryColors = {
    "Food": "#e74c3c",
    "Transport": "#3498db",
    "Shopping": "#9b59b6",
    "Education": "#27ae60",
    "Entertainment": "#f39c12",
    "Bills": "#1abc9c",
    "Other": "#95a5a6"
};

// --- Event Listeners ---
addExpenseButton.addEventListener("click", addExpense);
filterCategory.addEventListener("change", filterExpenses);
saveBudgetButton.addEventListener("click", saveBudget);
saveApiKeyButton.addEventListener("click", saveApiKey);
getAiTipsButton.addEventListener("click", getAiTips);

// --- Load on Page Open ---
loadExpenses();
loadBudget();
loadApiKey();


// =========================================
//  localStorage Functions
// =========================================

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

function saveBudget() {
    var budget = Number(monthlyBudget.value);
    if (budget <= 0) { alert("Please enter a valid budget amount."); return; }
    localStorage.setItem("monthlyBudget", budget);
    alert("Budget saved! ₹" + budget + " per month.");
    updateBudgetProgress();
}

function loadBudget() {
    var saved = localStorage.getItem("monthlyBudget");
    if (saved) monthlyBudget.value = saved;
}

function saveApiKey() {
    var key = geminiApiKey.value.trim();
    if (!key) { alert("Please enter a valid API key."); return; }
    localStorage.setItem("geminiApiKey", key);
    alert("API key saved!");
}

function loadApiKey() {
    var saved = localStorage.getItem("geminiApiKey");
    if (saved) geminiApiKey.value = saved;
}


// =========================================
//  Add / Delete / Filter Expenses
// =========================================

function addExpense() {
    var name = expenseName.value.trim();
    var amount = Number(expenseAmount.value);
    var category = expenseCategory.value;

    if (!name || amount <= 0 || !category) {
        alert("Please fill all fields with valid values.");
        return;
    }

    var now = new Date();
    allExpenses.push({
        id: Date.now(),
        name: name,
        amount: amount,
        category: category,
        date: now.toLocaleDateString(),
        month: now.getMonth(),
        year: now.getFullYear()
    });

    saveExpenses();
    expenseName.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "";
    filterCategory.value = "All";
    displayExpenses(allExpenses);
    updateMonthlySummary();
    updateBudgetProgress();
}

function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;

    var updated = [];
    for (var i = 0; i < allExpenses.length; i++) {
        if (allExpenses[i].id !== id) updated.push(allExpenses[i]);
    }
    allExpenses = updated;
    saveExpenses();
    filterCategory.value = "All";
    displayExpenses(allExpenses);
    updateMonthlySummary();
    updateBudgetProgress();
}

function filterExpenses() {
    var selected = filterCategory.value;

    if (selected === "All") {
        displayExpenses(allExpenses);
        return;
    }

    var filtered = [];
    for (var i = 0; i < allExpenses.length; i++) {
        if (allExpenses[i].category === selected) filtered.push(allExpenses[i]);
    }
    displayExpenses(filtered);
}


// =========================================
//  Display Expenses
// =========================================

function displayExpenses(expenses) {
    expenseList.innerHTML = "";

    var total = 0;
    for (var i = 0; i < expenses.length; i++) {
        total += expenses[i].amount;
    }

    totalExpense.innerText = "₹" + total;
    totalCount.innerText = expenses.length;
    emptyMessage.style.display = expenses.length === 0 ? "block" : "none";

    for (var i = 0; i < expenses.length; i++) {
        createExpenseCard(expenses[i]);
    }
}

function createExpenseCard(expense) {
    var item = document.createElement("div");
    item.className = "expense-item";

    var info = document.createElement("div");
    info.className = "expense-info";

    var name = document.createElement("h3");
    name.innerText = expense.name;

    var details = document.createElement("p");
    details.innerHTML = '<span class="category-badge">' + expense.category + '</span>' + expense.date;

    info.appendChild(name);
    info.appendChild(details);

    var right = document.createElement("div");
    right.className = "expense-right";

    var amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.innerText = "₹" + expense.amount;

    var delBtn = document.createElement("button");
    delBtn.innerText = "Delete";
    delBtn.className = "delete-button";
    delBtn.addEventListener("click", (function (id) {
        return function () { deleteExpense(id); };
    })(expense.id));

    right.appendChild(amount);
    right.appendChild(delBtn);
    item.appendChild(info);
    item.appendChild(right);
    expenseList.appendChild(item);
}


// =========================================
//  Monthly Summary
// =========================================

function getCurrentMonthExpenses() {
    var now = new Date();
    var m = now.getMonth();
    var y = now.getFullYear();
    var result = [];

    for (var i = 0; i < allExpenses.length; i++) {
        if (allExpenses[i].month === m && allExpenses[i].year === y) {
            result.push(allExpenses[i]);
        }
    }
    return result;
}

function getCategoryTotals(expenses) {
    var totals = {};
    for (var i = 0; i < expenses.length; i++) {
        var cat = expenses[i].category;
        totals[cat] = (totals[cat] || 0) + expenses[i].amount;
    }
    return totals;
}

function updateMonthlySummary() {
    var now = new Date();
    currentMonth.innerText = monthNames[now.getMonth()] + " " + now.getFullYear();

    var monthExpenses = getCurrentMonthExpenses();
    var monthTotal = 0;
    for (var i = 0; i < monthExpenses.length; i++) {
        monthTotal += monthExpenses[i].amount;
    }
    monthlyTotal.innerText = "₹" + monthTotal;

    if (monthExpenses.length === 0) {
        categoryBreakdown.innerHTML = '<p class="empty-message">No expenses this month yet.</p>';
        return;
    }

    var catTotals = getCategoryTotals(monthExpenses);
    var categories = Object.keys(catTotals);
    var html = "";

    for (var i = 0; i < categories.length; i++) {
        var catName = categories[i];
        var catAmount = catTotals[catName];
        var pct = Math.round((catAmount / monthTotal) * 100);
        var color = categoryColors[catName] || "#667eea";

        html +=
            '<div class="category-row"><div style="flex:1;">' +
            '<div style="display:flex;justify-content:space-between;">' +
            '<span class="category-name">' + catName + '</span>' +
            '<div class="category-details"><span class="category-amount">₹' + catAmount +
            '</span> <span class="category-percent">(' + pct + '%)</span></div></div>' +
            '<div class="category-bar-bg"><div class="category-bar-fill" style="width:' +
            pct + '%;background:' + color + ';"></div></div></div></div>';
    }

    categoryBreakdown.innerHTML = html;
}


// =========================================
//  Budget Progress
// =========================================

function updateBudgetProgress() {
    var budget = Number(localStorage.getItem("monthlyBudget"));
    if (!budget || budget <= 0) {
        budgetProgress.style.display = "none";
        return;
    }

    var monthExpenses = getCurrentMonthExpenses();
    var spent = 0;
    for (var i = 0; i < monthExpenses.length; i++) {
        spent += monthExpenses[i].amount;
    }

    var remaining = budget - spent;
    var percent = Math.round((spent / budget) * 100);

    budgetProgress.style.display = "block";
    budgetSpent.innerText = "₹" + spent + " spent";
    budgetRemaining.innerText = remaining >= 0
        ? "₹" + remaining + " remaining"
        : "₹" + Math.abs(remaining) + " over budget!";
    budgetRemaining.style.color = remaining >= 0 ? "#27ae60" : "#e74c3c";

    progressBarFill.style.width = Math.min(percent, 100) + "%";
    progressBarFill.className = "progress-bar-fill";

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


// =========================================
//  Gemini API — AI Spending Advice
// =========================================

function buildPrompt() {
    var monthExpenses = getCurrentMonthExpenses();
    var budget = Number(localStorage.getItem("monthlyBudget")) || 0;

    var monthTotal = 0;
    for (var i = 0; i < monthExpenses.length; i++) {
        monthTotal += monthExpenses[i].amount;
    }

    var catTotals = getCategoryTotals(monthExpenses);
    var now = new Date();
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var daysLeft = daysInMonth - now.getDate();

    var prompt = "You are a personal finance advisor. Analyze my monthly expenses and give me a smart spending plan.\n\n";
    prompt += "Month: " + monthNames[now.getMonth()] + " " + now.getFullYear() + "\n";
    prompt += "Days left in month: " + daysLeft + "\n";
    prompt += "Monthly Budget: ₹" + (budget > 0 ? budget : "Not set") + "\n";
    prompt += "Total Spent: ₹" + monthTotal + "\n\n";
    prompt += "Category-wise breakdown:\n";

    var categories = Object.keys(catTotals);
    for (var i = 0; i < categories.length; i++) {
        prompt += "- " + categories[i] + ": ₹" + catTotals[categories[i]] + "\n";
    }

    prompt += "\nBased on this data, provide:\n";
    prompt += "1. A brief analysis of my spending pattern (2 lines)\n";
    prompt += "2. 3 specific actionable tips to save money\n";
    prompt += "3. A suggested daily spending limit for the rest of the month\n";
    prompt += "4. One motivational line about saving\n\n";
    prompt += "Keep the response short, friendly and use ₹ for currency. Use emojis.";

    return prompt;
}

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

    getAiTipsButton.disabled = true;
    getAiTipsButton.innerText = "Analyzing...";
    spendingTips.innerHTML = '<div class="ai-loading"><span class="spinner"></span>Gemini is analyzing your expenses...</div>';

    var prompt = buildPrompt();
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

    var requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    try {
        var response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        var data = await response.json();

        if (!response.ok) {
            var errorMsg = (data.error && data.error.message) ? data.error.message : "API request failed.";
            spendingTips.innerHTML = '<div class="ai-error">❌ ' + errorMsg + '</div>';
            getAiTipsButton.disabled = false;
            getAiTipsButton.innerText = "✨ Get AI Advice";
            return;
        }

        var aiText = data.candidates[0].content.parts[0].text;
        var formatted = formatAiResponse(aiText);
        spendingTips.innerHTML = '<div class="tip-card">' + formatted + '</div>';

    } catch (error) {
        console.log("Gemini API error:", error);
        spendingTips.innerHTML = '<div class="ai-error">❌ Failed to connect to Gemini API. Check your API key and internet connection.</div>';
    }

    getAiTipsButton.disabled = false;
    getAiTipsButton.innerText = "✨ Get AI Advice";
}

function formatAiResponse(text) {
    // Convert markdown bold **text** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Convert markdown headers ### to bold
    text = text.replace(/###\s?(.*)/g, "<strong>$1</strong>");
    text = text.replace(/##\s?(.*)/g, "<strong>$1</strong>");
    // Convert line breaks to <br>
    text = text.replace(/\n/g, "<br>");
    return text;
}