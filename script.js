/* BudgetMind: Smart Expense Tracker Logic */

/* Firebase Setup & Configuration */
var firebaseConfig = {
    apiKey: "AIzaSyDr8VIsKWH22QPz2u-qPToW5acqS2UcIqU",
    authDomain: "smart-expense-tracker-fbd0a.firebaseapp.com",
    projectId: "smart-expense-tracker-fbd0a",
    storageBucket: "smart-expense-tracker-fbd0a.firebasestorage.app",
    messagingSenderId: "195030864438",
    appId: "1:195030864438:web:eadf6301b7a9f3ffccbe97"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var auth = firebase.auth();
var currentUser = null;

/* DOM Element Selectors */
var authLockScreen       = document.getElementById("authLockScreen");
var googleSignInGateBtn  = document.getElementById("googleSignInGateBtn");
var mainApp              = document.getElementById("mainApp");
var userProfile          = document.getElementById("userProfile");
var userAvatar           = document.getElementById("userAvatar");
var userName             = document.getElementById("userName");
var signOutBtn           = document.getElementById("signOutBtn");

var expenseName          = document.getElementById("expenseName");
var expenseAmount        = document.getElementById("expenseAmount");
var expenseCategory      = document.getElementById("expenseCategory");
var addExpenseButton     = document.getElementById("addExpenseButton");

var expenseList          = document.getElementById("expenseList");
var totalExpense         = document.getElementById("totalExpense");
var totalCount           = document.getElementById("totalCount");
var monthlyTotal         = document.getElementById("monthlyTotal");
var currentMonth         = document.getElementById("currentMonth");
var categoryBreakdown    = document.getElementById("categoryBreakdown");
var emptyMessage         = document.getElementById("emptyMessage");
var filterCategory       = document.getElementById("filterCategory");

var monthlyBudget        = document.getElementById("monthlyBudget");
var saveBudgetButton     = document.getElementById("saveBudgetButton");
var budgetProgress       = document.getElementById("budgetProgress");
var budgetSpent          = document.getElementById("budgetSpent");
var budgetRemaining      = document.getElementById("budgetRemaining");
var progressBarFill      = document.getElementById("progressBarFill");
var budgetPercentage     = document.getElementById("budgetPercentage");

var getAiTipsButton      = document.getElementById("getAiTipsButton");
var spendingTips         = document.getElementById("spendingTips");

var billFileInput      = document.getElementById("billFileInput");
var scanBillButton     = document.getElementById("scanBillButton");
var billStatus         = document.getElementById("billStatus");

/* Global Application State */
var allExpenses = [];
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var categoryColors = {
    "Food": "#e74c3c",
    "Transport": "#3498db",
    "Shopping": "#9b59b6",
    "Education": "#27ae60",
    "Entertainment": "#f39c12",
    "Bills": "#1abc9c",
    "Other": "#95a5a6"
};

/* Attach Event Handlers */
googleSignInGateBtn.addEventListener("click", signInWithGoogle);
signOutBtn.addEventListener("click", signOutUser);
addExpenseButton.addEventListener("click", addExpense);
filterCategory.addEventListener("change", filterExpenses);
saveBudgetButton.addEventListener("click", saveBudget);
getAiTipsButton.addEventListener("click", getAiTips);
scanBillButton.addEventListener("click", scanBillFile);

/* Authentication Observer */
auth.onAuthStateChanged(function(user) {
    if (user) {
        currentUser = user;
        authLockScreen.style.display = "none";
        mainApp.style.display = "block";
        userProfile.style.display = "flex";
        userAvatar.src = user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80";
        userName.innerText = user.displayName || user.email || "User";
        loadExpenses();
        loadBudget();
    } else {
        currentUser = null;
        authLockScreen.style.display = "flex";
        mainApp.style.display = "none";
        userProfile.style.display = "none";
        allExpenses = [];
    }
});

/* Google Sign In */
function signInWithGoogle() {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(function(error) {
        alert("Authentication failed: " + error.message);
    });
}

/* Sign Out */
function signOutUser() {
    auth.signOut().then(function() {
        allExpenses = [];
    }).catch(function(error) {
        console.error("Sign out error:", error);
    });
}

/* Load User Expenses from Firestore */
function loadExpenses() {
    if (!currentUser) return;

    db.collection("expenses").where("userId", "==", currentUser.uid).get().then(function(snapshot) {
        allExpenses = [];
        snapshot.forEach(function(doc) {
            var expense = doc.data();
            expense.id = doc.id;
            allExpenses.push(expense);
        });

        filterCategory.value = "All";
        displayExpenses(allExpenses);
        updateMonthlySummary();
        updateBudgetProgress();
    }).catch(function(error) {
        console.error("Error loading expenses:", error);
    });
}

/* Add New Expense to Firestore */
function addExpense() {
    if (!currentUser) {
        alert("Please sign in to add expenses.");
        return;
    }

    var name     = expenseName.value.trim();
    var amount   = Number(expenseAmount.value);
    var category = expenseCategory.value;

    if (!name || amount <= 0 || !category) {
        alert("Please enter a valid expense name, amount, and category.");
        return;
    }

    var now = new Date();
    var newExpense = {
        userId:   currentUser.uid,
        name:     name,
        amount:   amount,
        category: category,
        date:     now.toLocaleDateString(),
        month:    now.getMonth(),
        year:     now.getFullYear()
    };

    db.collection("expenses").add(newExpense).then(function() {
        expenseName.value     = "";
        expenseAmount.value   = "";
        expenseCategory.value = "";
        loadExpenses();
    }).catch(function(error) {
        console.error("Error adding expense:", error);
        alert("Failed to add expense. Please try again.");
    });
}

/* Delete Expense from Firestore */
function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    db.collection("expenses").doc(id).delete().then(function() {
        loadExpenses();
    }).catch(function(error) {
        console.error("Error deleting expense:", error);
        alert("Failed to delete expense.");
    });
}

/* User Budget Management */
function loadBudget() {
    if (!currentUser) return;
    var saved = localStorage.getItem("monthlyBudget_" + currentUser.uid);
    monthlyBudget.value = saved ? saved : "";
}

function saveBudget() {
    if (!currentUser) return;
    var budget = Number(monthlyBudget.value);
    if (budget <= 0) {
        alert("Please enter a valid budget amount.");
        return;
    }

    localStorage.setItem("monthlyBudget_" + currentUser.uid, budget);
    alert("Monthly budget saved: ₹" + budget);
    updateBudgetProgress();
}

/* Expense Category Filtering */
function filterExpenses() {
    var selected = filterCategory.value;
    if (selected === "All") {
        displayExpenses(allExpenses);
        return;
    }

    var filtered = allExpenses.filter(function(item) {
        return item.category === selected;
    });
    displayExpenses(filtered);
}

/* Render Expense Cards */
function displayExpenses(expenses) {
    expenseList.innerHTML = "";
    var total = 0;
    for (var i = 0; i < expenses.length; i++) {
        total += expenses[i].amount;
    }

    totalExpense.innerText = "₹" + total;
    totalCount.innerText   = expenses.length;
    emptyMessage.style.display = (expenses.length === 0) ? "block" : "none";

    for (var i = 0; i < expenses.length; i++) {
        createExpenseCard(expenses[i]);
    }
}

/* Create Expense DOM Node */
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
    delBtn.addEventListener("click", function() {
        deleteExpense(expense.id);
    });

    right.appendChild(amount);
    right.appendChild(delBtn);
    item.appendChild(info);
    item.appendChild(right);
    expenseList.appendChild(item);
}

/* Helper Functions */
function getCurrentMonthExpenses() {
    var now       = new Date();
    var thisMonth = now.getMonth();
    var thisYear  = now.getFullYear();

    return allExpenses.filter(function(item) {
        return item.month === thisMonth && item.year === thisYear;
    });
}

function getCategoryTotals(expenses) {
    var totals = {};
    for (var i = 0; i < expenses.length; i++) {
        var cat = expenses[i].category || "Other";
        totals[cat] = (totals[cat] || 0) + expenses[i].amount;
    }
    return totals;
}

/* Render Monthly Breakdown */
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
        categoryBreakdown.innerHTML = '<p class="empty-message">No expenses recorded for this month.</p>';
        return;
    }

    var catTotals  = getCategoryTotals(monthExpenses);
    var categories = Object.keys(catTotals);
    var html = "";

    for (var i = 0; i < categories.length; i++) {
        var catName   = categories[i];
        var catAmount = catTotals[catName];
        var percent   = Math.round((catAmount / monthTotal) * 100);
        var color     = categoryColors[catName] || "#95a5a6";

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

/* Budget Progress Indicator */
function updateBudgetProgress() {
    if (!currentUser) return;

    var budget = Number(localStorage.getItem("monthlyBudget_" + currentUser.uid));
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
    var percent   = Math.round((spent / budget) * 100);

    budgetProgress.style.display = "block";
    budgetSpent.innerText = "₹" + spent + " spent";

    if (remaining >= 0) {
        budgetRemaining.innerText = "₹" + remaining + " remaining";
        budgetRemaining.style.color = "#27ae60";
    } else {
        budgetRemaining.innerText = "₹" + Math.abs(remaining) + " over budget!";
        budgetRemaining.style.color = "#e74c3c";
    }

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

/* Build Gemini AI Prompt */
function buildPrompt() {
    var monthExpenses = getCurrentMonthExpenses();
    var budget = currentUser ? (Number(localStorage.getItem("monthlyBudget_" + currentUser.uid)) || 0) : 0;

    var monthTotal = 0;
    for (var i = 0; i < monthExpenses.length; i++) {
        monthTotal += monthExpenses[i].amount;
    }

    var catTotals  = getCategoryTotals(monthExpenses);
    var categories = Object.keys(catTotals);

    var now         = new Date();
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var daysLeft    = daysInMonth - now.getDate();

    var prompt = "You are an expert financial advisor for BudgetMind. Analyze my monthly expenses and give me a smart spending plan.\n\n"
        + "Month: " + monthNames[now.getMonth()] + " " + now.getFullYear() + "\n"
        + "Days left in month: " + daysLeft + "\n"
        + "Monthly Budget: ₹" + (budget > 0 ? budget : "Not set") + "\n"
        + "Total Spent: ₹" + monthTotal + "\n\n"
        + "Category-wise breakdown:\n";

    for (var i = 0; i < categories.length; i++) {
        prompt += "- " + categories[i] + ": ₹" + catTotals[categories[i]] + "\n";
    }

    prompt += "\nProvide an ultra-concise 3-bullet spending summary:\n"
        + "• 💡 **Key Insight**: 1 sentence on top spending area.\n"
        + "• 🎯 **Daily Limit**: Recommended max spend/day for the remaining " + daysLeft + " days.\n"
        + "• ⚡ **Top Action**: 1 direct tip to save money immediately.\n\n"
        + "Strict rules: No filler intro or outro, exactly 3 bullet points, use ₹ for currency, keep under 60 words total.";

    return prompt;
}

/* Request AI Advice */
async function getAiTips() {
    var monthExpenses = getCurrentMonthExpenses();

    if (monthExpenses.length === 0) {
        spendingTips.innerHTML = '<div class="tip-card">Add some expenses first to get AI-powered advice!</div>';
        return;
    }

    getAiTipsButton.disabled = true;
    getAiTipsButton.innerText = "Analyzing...";
    spendingTips.innerHTML = '<div class="ai-loading"><span class="spinner"></span>Gemini is analyzing your spending...</div>';

    var prompt = buildPrompt();

    try {
        var response = await fetch("/api/advice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt })
        });

        var data = await response.json();

        if (!response.ok || !data.candidates || !data.candidates[0]) {
            var errorMsg = (data && data.error) ? data.error : "Failed to get AI advice.";
            spendingTips.innerHTML = '<div class="ai-error">❌ ' + errorMsg + '</div>';
            resetAiButton();
            return;
        }

        var aiText = data.candidates[0].content.parts[0].text;
        spendingTips.innerHTML = '<div class="tip-card">' + formatAiResponse(aiText) + '</div>';

    } catch (error) {
        console.error("Error fetching AI advice:", error);
        spendingTips.innerHTML = '<div class="ai-error">❌ Failed to connect to AI service.</div>';
    }

    resetAiButton();
}

function resetAiButton() {
    getAiTipsButton.disabled = false;
    getAiTipsButton.innerText = "✨ Get AI Advice";
}

function formatAiResponse(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/###\s?(.*)/g, "<strong>$1</strong>");
    text = text.replace(/##\s?(.*)/g, "<strong>$1</strong>");
    text = text.replace(/\n/g, "<br>");
    return text;
}

/* Bill Document Scanner with Gemini AI */
async function scanBillFile() {
    if (!currentUser) {
        alert("Please sign in to scan bills.");
        return;
    }

    var file = billFileInput.files[0];

    if (!file) {
        billStatus.innerHTML = '<span style="color: #e74c3c;">❌ Please select a receipt file (PDF, Image, CSV) first.</span>';
        return;
    }

    scanBillButton.disabled = true;
    scanBillButton.innerText = "Scanning with Gemini AI...";
    billStatus.innerHTML = '<span style="color: #667eea;">⏳ Gemini AI is analyzing your bill... Please wait.</span>';

    var reader = new FileReader();
    var fileType = file.type || "";
    var isTextOrCsv = file.name.endsWith(".csv") || file.name.endsWith(".txt") || fileType.includes("text") || fileType.includes("csv");

    if (isTextOrCsv) {
        reader.onload = function(e) {
            sendBillPayload({ textContent: e.target.result });
        };
        reader.readAsText(file);
    } else {
        reader.onload = function(e) {
            var dataUrl = e.target.result;
            var base64Data = dataUrl.split(",")[1];
            sendBillPayload({
                mimeType: fileType || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
                fileData: base64Data
            });
        };
        reader.readAsDataURL(file);
    }
}

async function sendBillPayload(payload) {
    try {
        var response = await fetch("/api/scan-bill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        var data = await response.json();

        if (!response.ok || !data.items || data.items.length === 0) {
            var errorMsg = (data && data.error) ? data.error : "Could not extract expenses from this file.";
            billStatus.innerHTML = '<span style="color: #e74c3c;">❌ ' + errorMsg + '</span>';
            resetScanButton();
            return;
        }

        var now = new Date();
        var promises = [];
        var items = data.items;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.name && Number(item.amount) > 0) {
                var newExpense = {
                    userId:   currentUser.uid,
                    name:     item.name,
                    amount:   Number(item.amount),
                    category: item.category || "Other",
                    date:     now.toLocaleDateString(),
                    month:    now.getMonth(),
                    year:     now.getFullYear()
                };
                promises.push(db.collection("expenses").add(newExpense));
            }
        }

        await Promise.all(promises);
        billStatus.innerHTML = '<span style="color: #27ae60;">✅ Successfully extracted & saved ' + promises.length + ' expenses from bill!</span>';
        billFileInput.value = "";
        loadExpenses();

    } catch (error) {
        console.error("Error sending bill payload:", error);
        billStatus.innerHTML = '<span style="color: #e74c3c;">❌ Failed to process bill file.</span>';
    }

    resetScanButton();
}

function resetScanButton() {
    scanBillButton.disabled = false;
    scanBillButton.innerText = "✨ Scan & Auto-Extract with AI";
}