// ============================================================
// ðŸ’³ Expense Tracker Widget for Scriptable
// ============================================================
// ×’×¨×¡×”: 1.0
// ×ª×™××•×¨: ×•×™×“×’'×˜ ×ž×¡×š ×”×‘×™×ª ×œ×ž×¢×§×‘ ×”×•×¦××•×ª ××©×¨××™
// ×“×¨×™×©×•×ª: Data Jar ×ž×•×ª×§×Ÿ ×¢× ×ž×‘× ×” × ×ª×•× ×™× ×ž×•×’×“×¨
// ============================================================

// â”€â”€â”€ ×”×’×“×¨×•×ª â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CONFIG = {
  // ×¦×‘×¢×™×
  colors: {
    background: new Color("#1C1C1E"),
    cardBg: new Color("#2C2C2E"),
    titleText: new Color("#FFFFFF"),
    amountText: new Color("#34C759"),
    amountWarning: new Color("#FF9F0A"),
    amountDanger: new Color("#FF453A"),
    subtitleText: new Color("#8E8E93"),
    categoryText: new Color("#FFFFFF", 0.9),
    separator: new Color("#3A3A3C"),
    cardIndicator: new Color("#007AFF"),
  },
  // ×ª×§×¦×™×‘ ×—×•×“×©×™ (×©× ×” ×œ×¤×™ ×”×¦×•×¨×š)
  monthlyBudget: 5000,
  // ×ž×¡×¤×¨ ×§×˜×’×•×¨×™×•×ª ×ž×•×‘×™×œ×•×ª ×œ×”×¦×’×” ×‘×•×•×™×“×’'×˜ ×‘×™× ×•× ×™
  topCategoriesCount: 4,
};

// â”€â”€â”€ ×§×¨×™××ª × ×ª×•× ×™× â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadExpensesFromDataJar() {
  // ×§×¨×™××” ×ž×§×•×‘×¥ JSON ×©× ×•×¦×¨ ×¢×œ ×™×“×™ ExpenseSync
  // ×”×§×•×‘×¥ ×ž×ª×¢×“×›×Ÿ ××•×˜×•×ž×˜×™×ª ××—×¨×™ ×›×œ ×¢×¡×§×” (×“×¨×š Shortcut)
  // ××• ×™×“× ×™×ª ×“×¨×š "×”×•×¦××•×ª ×©×œ×™" â†’ "ðŸ”„ ×¡× ×›×¨×•×Ÿ Widget"
  try {
    const fm = FileManager.iCloud();
    const dir = fm.documentsDirectory();
    const path = fm.joinPath(dir, "ExpenseTracker");

    if (!fm.fileExists(path)) {
      fm.createDirectory(path, true);
    }

    const filePath = fm.joinPath(path, "expenses.json");

    if (fm.fileExists(filePath)) {
      await fm.downloadFileFromiCloud(filePath);
      const raw = fm.readString(filePath);
      const data = JSON.parse(raw);
      if (data && (data.transactions || data.monthlyTotal !== undefined)) {
        return data;
      }
    }
  } catch (e) {
    console.error("Error loading expenses.json: " + e);
  }

  // ×”×—×–×¨×ª ×ž×‘× ×” ×¨×™×§ ×× ××™×Ÿ × ×ª×•× ×™×
  return { transactions: [], monthlyTotal: 0 };
}

// â”€â”€â”€ ×¤×¢× ×•×— ×ª××¨×™×š (×ª×•×ž×š ×‘-dd-MM-yyyy ×•×’× yyyy-MM-dd) â”€â”€â”€â”€â”€â”€
function parseDate(dateStr) {
  if (!dateStr) return new Date(NaN);
  // dd-MM-yyyy (×œ×ž×©×œ 26-02-2026)
  const ddmmyyyy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
  }
  // yyyy-MM-dd (ISO â€” ×œ×ž×©×œ 2026-02-26)
  return new Date(dateStr);
}

// â”€â”€â”€ ×¤×™×œ×˜×¨ ×¢×¡×§××•×ª ×œ×—×•×“×© ×”× ×•×›×—×™ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function filterCurrentMonth(transactions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions.filter((t) => {
    const d = parseDate(t.date);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
}

// â”€â”€â”€ ×—×™×©×•×‘ ×¡×˜×˜×™×¡×˜×™×§×•×ª â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function calculateStats(transactions, data) {
  const monthlyTransactions = filterCurrentMonth(transactions);

  // ×¡×”"×› ×”×—×•×“×© â€” ×ž×—×©×‘ ××š ×•×¨×§ ×ž×¢×¡×§××•×ª ×”×—×•×“×© ×”× ×•×›×—×™
  const totalSpent = monthlyTransactions.reduce(
    (sum, t) => sum + (parseFloat(t.amount) || 0),
    0
  );

  // ×¤×™×¨×•×˜ ×œ×¤×™ ×§×˜×’×•×¨×™×”
  const byCategory = {};
  monthlyTransactions.forEach((t) => {
    const cat = t.category || "âœ¨ ××—×¨";
    byCategory[cat] = (byCategory[cat] || 0) + (parseFloat(t.amount) || 0);
  });

  // ×ž×™×•×Ÿ ×§×˜×’×•×¨×™×•×ª ×ž×”×’×‘×•×”×” ×œ× ×ž×•×›×”
  const sortedCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, CONFIG.topCategoriesCount);

  // ×¤×™×¨×•×˜ ×œ×¤×™ ×›×¨×˜×™×¡
  const byCard = {};
  monthlyTransactions.forEach((t) => {
    const card = t.card || "????";
    byCard[card] = (byCard[card] || 0) + (parseFloat(t.amount) || 0);
  });

  // ×¢×¡×§×” ××—×¨×•× ×”
  const lastTransaction =
    monthlyTransactions.length > 0
      ? monthlyTransactions[monthlyTransactions.length - 1]
      : null;

  return {
    totalSpent,
    sortedCategories,
    byCard,
    lastTransaction,
    transactionCount: monthlyTransactions.length,
  };
}

// â”€â”€â”€ ×¤×•×¨×ž×˜ ×ž×¡×¤×¨ ×œ×©"×— â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function formatCurrency(amount) {
  return "â‚ª" + amount.toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatCurrencyDetailed(amount) {
  return "â‚ª" + amount.toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// â”€â”€â”€ ×¦×‘×¢ ×¡×›×•× ×œ×¤×™ ×ª×§×¦×™×‘ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getAmountColor(spent) {
  const ratio = spent / CONFIG.monthlyBudget;
  if (ratio < 0.7) return CONFIG.colors.amountText;      // ×™×¨×•×§
  if (ratio < 0.9) return CONFIG.colors.amountWarning;    // ×›×ª×•×
  return CONFIG.colors.amountDanger;                       // ××“×•×
}

// â”€â”€â”€ ×©× ×—×•×“×© ×‘×¢×‘×¨×™×ª â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getHebrewMonth() {
  const months = [
    "×™× ×•××¨", "×¤×‘×¨×•××¨", "×ž×¨×¡", "××¤×¨×™×œ", "×ž××™", "×™×•× ×™",
    "×™×•×œ×™", "××•×’×•×¡×˜", "×¡×¤×˜×ž×‘×¨", "××•×§×˜×•×‘×¨", "× ×•×‘×ž×‘×¨", "×“×¦×ž×‘×¨",
  ];
  const now = new Date();
  return months[now.getMonth()] + " " + now.getFullYear();
}

// â”€â”€â”€ Progress Bar (RTL â€” ×ž×ª×ž×œ× ×ž×™×ž×™×Ÿ ×œ×©×ž××œ) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function addProgressBar(stack, spent, budget, width) {
  const ratio = Math.min(spent / budget, 1.0);
  const barHeight = 6;

  const barStack = stack.addStack();
  barStack.layoutHorizontally();
  barStack.cornerRadius = barHeight / 2;
  barStack.size = new Size(width, barHeight);
  barStack.backgroundColor = CONFIG.colors.separator;

  // ×ž×™× ×™×ž×•× 6px ×›×“×™ ×©×”×‘×¨ ×™×”×™×” × ×¨××” ×’× ×‘×¡×›×•×ž×™× × ×ž×•×›×™×
  const filledWidth = spent > 0 ? Math.max(ratio * width, 6) : 0;

  // Spacer ×“×•×—×£ ××ª ×”×‘×¨ ×™×ž×™× ×” (RTL)
  const emptyWidth = width - filledWidth;
  if (emptyWidth > 0) {
    const spacer = barStack.addStack();
    spacer.size = new Size(emptyWidth, barHeight);
  }

  const filledBar = barStack.addStack();
  filledBar.size = new Size(filledWidth, barHeight);
  filledBar.cornerRadius = barHeight / 2;
  filledBar.backgroundColor = getAmountColor(spent);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SMALL WIDGET (2Ã—2)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function createSmallWidget(stats) {
  const widget = new ListWidget();
  widget.backgroundColor = CONFIG.colors.background;
  widget.setPadding(16, 16, 16, 16);

  // ×›×•×ª×¨×ª
  const titleStack = widget.addStack();
  titleStack.layoutHorizontally();
  titleStack.centerAlignContent();

  const icon = titleStack.addText("ðŸ’³");
  icon.font = Font.systemFont(14);

  titleStack.addSpacer(4);

  const title = titleStack.addText("×”×•×¦××•×ª ×”×—×•×“×©");
  title.font = Font.boldSystemFont(13);
  title.textColor = CONFIG.colors.subtitleText;

  widget.addSpacer(8);

  // ×¡×›×•× ×¨××©×™
  const amountText = widget.addText(formatCurrency(stats.totalSpent));
  amountText.font = Font.boldSystemFont(28);
  amountText.textColor = getAmountColor(stats.totalSpent);
  amountText.minimumScaleFactor = 0.6;

  widget.addSpacer(4);

  // Progress bar
  addProgressBar(widget, stats.totalSpent, CONFIG.monthlyBudget, 120);

  widget.addSpacer(4);

  // ×ª×§×¦×™×‘
  const budgetText = widget.addText(
    `×ž×ª×•×š ${formatCurrency(CONFIG.monthlyBudget)}`
  );
  budgetText.font = Font.systemFont(11);
  budgetText.textColor = CONFIG.colors.subtitleText;

  widget.addSpacer(4);

  // ×¢×¡×§×” ××—×¨×•× ×”
  if (stats.lastTransaction) {
    const lastLine = widget.addText(
      `${stats.lastTransaction.merchant} ${formatCurrency(parseFloat(stats.lastTransaction.amount))}`
    );
    lastLine.font = Font.systemFont(10);
    lastLine.textColor = CONFIG.colors.subtitleText;
    lastLine.lineLimit = 1;
  }

  return widget;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MEDIUM WIDGET (4Ã—2)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function createMediumWidget(stats) {
  const widget = new ListWidget();
  widget.backgroundColor = CONFIG.colors.background;
  widget.setPadding(14, 16, 14, 16);

  // â”€â”€ ×©×•×¨×” ×¢×œ×™×•× ×”: ×›×•×ª×¨×ª + ×¡×›×•× â”€â”€
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();

  const titleLeft = headerStack.addStack();
  titleLeft.layoutHorizontally();
  titleLeft.centerAlignContent();

  const icon = titleLeft.addText("ðŸ’³");
  icon.font = Font.systemFont(14);
  titleLeft.addSpacer(4);

  const monthLabel = titleLeft.addText(getHebrewMonth());
  monthLabel.font = Font.boldSystemFont(14);
  monthLabel.textColor = CONFIG.colors.titleText;

  headerStack.addSpacer();

  const totalAmount = headerStack.addText(
    formatCurrencyDetailed(stats.totalSpent)
  );
  totalAmount.font = Font.boldSystemFont(22);
  totalAmount.textColor = getAmountColor(stats.totalSpent);
  totalAmount.minimumScaleFactor = 0.7;

  widget.addSpacer(4);

  // Progress bar
  addProgressBar(widget, stats.totalSpent, CONFIG.monthlyBudget, 300);

  widget.addSpacer(2);

  // ×ª×§×¦×™×‘ ×©×•×¨×”
  const budgetRow = widget.addStack();
  budgetRow.layoutHorizontally();

  const countText = budgetRow.addText(
    `${stats.transactionCount} ×¢×¡×§××•×ª`
  );
  countText.font = Font.systemFont(10);
  countText.textColor = CONFIG.colors.subtitleText;

  budgetRow.addSpacer();

  const budgetLabel = budgetRow.addText(
    `×ª×§×¦×™×‘: ${formatCurrency(CONFIG.monthlyBudget)}`
  );
  budgetLabel.font = Font.systemFont(10);
  budgetLabel.textColor = CONFIG.colors.subtitleText;

  widget.addSpacer(6);

  // â”€â”€ ×§×• ×ž×¤×¨×™×“ â”€â”€
  const sep = widget.addStack();
  sep.size = new Size(0, 1);
  sep.backgroundColor = CONFIG.colors.separator;

  widget.addSpacer(6);

  // â”€â”€ ×©×•×¨×ª ×§×˜×’×•×¨×™×•×ª â”€â”€
  const catStack = widget.addStack();
  catStack.layoutHorizontally();

  if (stats.sortedCategories.length > 0) {
    stats.sortedCategories.forEach((cat, i) => {
      if (i > 0) catStack.addSpacer(8);

      const catItem = catStack.addStack();
      catItem.layoutVertically();
      catItem.centerAlignContent();

      // ×©× ×§×˜×’×•×¨×™×” ×ž×œ× (××™×ž×•×’'×™ + ×©×)
      const catLabel = catItem.addText(cat[0]);
      catLabel.font = Font.systemFont(12);
      catLabel.textColor = CONFIG.colors.titleText;
      catLabel.centerAlignText();
      catLabel.lineLimit = 1;

      const amtText = catItem.addText(formatCurrency(cat[1]));
      amtText.font = Font.boldSystemFont(11);
      amtText.textColor = CONFIG.colors.categoryText;
      amtText.centerAlignText();
    });
  } else {
    const noData = catStack.addText("××™×Ÿ ×¢×¡×§××•×ª ×¢×“×™×™×Ÿ");
    noData.font = Font.systemFont(12);
    noData.textColor = CONFIG.colors.subtitleText;
  }

  catStack.addSpacer();

  widget.addSpacer(6);

  // â”€â”€ ×©×•×¨×ª ×›×¨×˜×™×¡×™× + ×¢×¡×§×” ××—×¨×•× ×” â”€â”€
  const bottomStack = widget.addStack();
  bottomStack.layoutHorizontally();
  bottomStack.centerAlignContent();

  // ×›×¨×˜×™×¡×™×
  const cards = Object.entries(stats.byCard);
  if (cards.length > 0) {
    const cardsText = cards
      .map(([card, amount]) => `****${card}: ${formatCurrency(amount)}`)
      .join("  |  ");

    const cardLabel = bottomStack.addText("ðŸ’³ " + cardsText);
    cardLabel.font = Font.systemFont(10);
    cardLabel.textColor = CONFIG.colors.cardIndicator;
    cardLabel.lineLimit = 1;
  }

  bottomStack.addSpacer();

  // ×¢×¡×§×” ××—×¨×•× ×”
  if (stats.lastTransaction) {
    const lastText = bottomStack.addText(
      `××—×¨×•× ×”: ${stats.lastTransaction.merchant} ${formatCurrency(parseFloat(stats.lastTransaction.amount))}`
    );
    lastText.font = Font.systemFont(10);
    lastText.textColor = CONFIG.colors.subtitleText;
    lastText.lineLimit = 1;
  }

  return widget;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LARGE WIDGET (4Ã—4)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function createLargeWidget(stats, transactions) {
  const widget = new ListWidget();
  widget.backgroundColor = CONFIG.colors.background;
  widget.setPadding(16, 16, 16, 16);

  // â”€â”€ ×›×•×ª×¨×ª â”€â”€
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();

  const icon = headerStack.addText("ðŸ’³");
  icon.font = Font.systemFont(18);
  headerStack.addSpacer(6);

  const title = headerStack.addText("×”×•×¦××•×ª " + getHebrewMonth());
  title.font = Font.boldSystemFont(18);
  title.textColor = CONFIG.colors.titleText;

  headerStack.addSpacer();

  const totalAmount = headerStack.addText(
    formatCurrencyDetailed(stats.totalSpent)
  );
  totalAmount.font = Font.boldSystemFont(24);
  totalAmount.textColor = getAmountColor(stats.totalSpent);

  widget.addSpacer(6);

  // Progress bar
  addProgressBar(widget, stats.totalSpent, CONFIG.monthlyBudget, 330);

  widget.addSpacer(3);

  const budgetLine = widget.addStack();
  budgetLine.layoutHorizontally();

  const pctUsed = Math.round(
    (stats.totalSpent / CONFIG.monthlyBudget) * 100
  );
  const pctText = budgetLine.addText(
    `${pctUsed}% ×ž×”×ª×§×¦×™×‘ (${formatCurrency(CONFIG.monthlyBudget)})`
  );
  pctText.font = Font.systemFont(11);
  pctText.textColor = CONFIG.colors.subtitleText;

  budgetLine.addSpacer();

  const countLabel = budgetLine.addText(
    `${stats.transactionCount} ×¢×¡×§××•×ª`
  );
  countLabel.font = Font.systemFont(11);
  countLabel.textColor = CONFIG.colors.subtitleText;

  widget.addSpacer(8);

  // â”€â”€ ×§×˜×’×•×¨×™×•×ª â”€â”€
  const catTitle = widget.addText("ðŸ“‚ ×œ×¤×™ ×§×˜×’×•×¨×™×”");
  catTitle.font = Font.boldSystemFont(13);
  catTitle.textColor = CONFIG.colors.titleText;

  widget.addSpacer(4);

  stats.sortedCategories.forEach((cat) => {
    const row = widget.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();

    const catName = row.addText(cat[0]);
    catName.font = Font.systemFont(12);
    catName.textColor = CONFIG.colors.categoryText;

    row.addSpacer();

    const pct = Math.round((cat[1] / stats.totalSpent) * 100);
    const catAmount = row.addText(
      `${formatCurrency(cat[1])}  (${pct}%)`
    );
    catAmount.font = Font.monospaceSystemFont(12);
    catAmount.textColor = CONFIG.colors.subtitleText;

    widget.addSpacer(2);
  });

  widget.addSpacer(6);

  // â”€â”€ ×›×¨×˜×™×¡×™× â”€â”€
  const cards = Object.entries(stats.byCard);
  if (cards.length > 0) {
    const cardTitle = widget.addText("ðŸ’³ ×œ×¤×™ ×›×¨×˜×™×¡");
    cardTitle.font = Font.boldSystemFont(13);
    cardTitle.textColor = CONFIG.colors.titleText;

    widget.addSpacer(4);

    cards.forEach(([card, amount]) => {
      const row = widget.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();

      const cardLabel = row.addText(`****${card}`);
      cardLabel.font = Font.monospaceSystemFont(12);
      cardLabel.textColor = CONFIG.colors.cardIndicator;

      row.addSpacer();

      const cardAmt = row.addText(formatCurrency(amount));
      cardAmt.font = Font.monospaceSystemFont(12);
      cardAmt.textColor = CONFIG.colors.subtitleText;

      widget.addSpacer(2);
    });
  }

  widget.addSpacer(6);

  // â”€â”€ ×¢×¡×§××•×ª ××—×¨×•× ×•×ª â”€â”€
  const monthlyTransactions = filterCurrentMonth(transactions);
  const recentTransactions = monthlyTransactions.slice(-5).reverse();

  if (recentTransactions.length > 0) {
    const sep2 = widget.addStack();
    sep2.size = new Size(0, 1);
    sep2.backgroundColor = CONFIG.colors.separator;

    widget.addSpacer(4);

    const recentTitle = widget.addText("ðŸ“‹ ×¢×¡×§××•×ª ××—×¨×•× ×•×ª");
    recentTitle.font = Font.boldSystemFont(13);
    recentTitle.textColor = CONFIG.colors.titleText;

    widget.addSpacer(4);

    recentTransactions.forEach((t) => {
      const row = widget.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();

      const dateStr = t.date ? t.date.substring(5).replace("-", "/") : "";
      const dateLabel = row.addText(dateStr);
      dateLabel.font = Font.monospaceSystemFont(10);
      dateLabel.textColor = CONFIG.colors.subtitleText;

      row.addSpacer(6);

      const merchantLabel = row.addText(t.merchant || "");
      merchantLabel.font = Font.systemFont(11);
      merchantLabel.textColor = CONFIG.colors.categoryText;
      merchantLabel.lineLimit = 1;

      row.addSpacer();

      const amtLabel = row.addText(
        formatCurrency(parseFloat(t.amount) || 0)
      );
      amtLabel.font = Font.monospaceSystemFont(11);
      amtLabel.textColor = CONFIG.colors.subtitleText;

      row.addSpacer(4);

      const emoji = (t.category || "").split(" ")[0] || "âœ¨";
      const catEmoji = row.addText(emoji);
      catEmoji.font = Font.systemFont(11);

      row.addSpacer(4);

      const cardNum = row.addText(`****${t.card || "????"}`);
      cardNum.font = Font.monospaceSystemFont(9);
      cardNum.textColor = CONFIG.colors.cardIndicator;

      widget.addSpacer(1);
    });
  }

  return widget;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
async function main() {
  const data = await loadExpensesFromDataJar();
  const transactions = data.transactions || [];
  const stats = calculateStats(transactions, data);

  let widget;
  const widgetFamily =
    config.widgetFamily || (args.widgetParameter ? args.widgetParameter : "medium");

  switch (widgetFamily) {
    case "small":
      widget = createSmallWidget(stats);
      break;
    case "medium":
      widget = createMediumWidget(stats);
      break;
    case "large":
      widget = createLargeWidget(stats, transactions);
      break;
    default:
      widget = createMediumWidget(stats);
  }

  // ×œ×—×™×¦×” ×¢×œ Widget â†’ ×ž×¨×¢× ×Ÿ ××ª ×”Widget (×ž×¨×™×¥ ××ª ×”×¡×§×¨×™×¤×˜ ×ž×—×“×©)
  // ×× ×¨×•×¦×™× ×œ×¤×ª×•×— Shortcut ×‘×ž×§×•×, ×©× ×” ×‘-Scriptable:
  // â‹¯ â†’ Widget â†’ When Interacting â†’ Open URL â†’ shortcuts://run-shortcut?name=×”×•×¦××•×ª%20×©×œ×™
  // widget.url = "shortcuts://run-shortcut?name=" + encodeURIComponent("×”×•×¦××•×ª ×©×œ×™");

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    // ×”×¦×’×ª ×ž×™×“×¢ ×“×™×‘××’ ×œ×¤× ×™ ×ª×¦×•×’×ª Widget
    const debugMsg = [
      "ðŸ“Š Debug Info:",
      "transactions total: " + transactions.length,
      "filtered (this month): " + stats.transactionCount,
      "totalSpent: â‚ª" + stats.totalSpent,
      "categories: " + stats.sortedCategories.length,
      "last: " + (stats.lastTransaction ? stats.lastTransaction.merchant + " â‚ª" + stats.lastTransaction.amount : "none"),
    ].join("\n");
    
    const debugAlert = new Alert();
    debugAlert.title = "Widget Debug";
    debugAlert.message = debugMsg;
    debugAlert.addAction("Show Widget");
    await debugAlert.present();
    
    // ×ª×¦×•×’×” ×ž×§×“×™×ž×” ×‘×”×¨×¦×” ×ž×ª×•×š Scriptable
    switch (widgetFamily) {
      case "small":
        await widget.presentSmall();
        break;
      case "medium":
        await widget.presentMedium();
        break;
      case "large":
        await widget.presentLarge();
        break;
    }
  }

  Script.complete();
}

await main();
