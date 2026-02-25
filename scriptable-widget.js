// ============================================================
// 💳 Expense Tracker Widget for Scriptable
// ============================================================
// גרסה: 1.0
// תיאור: וידג'ט מסך הבית למעקב הוצאות אשראי
// דרישות: Data Jar מותקן עם מבנה נתונים מוגדר
// ============================================================

// ─── הגדרות ───────────────────────────────────────────────
const CONFIG = {
  // צבעים
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
  // תקציב חודשי (שנה לפי הצורך)
  monthlyBudget: 5000,
  // מספר קטגוריות מובילות להצגה בווידג'ט בינוני
  topCategoriesCount: 4,
};

// ─── קריאת נתונים ───────────────────────────────────────
async function loadExpensesFromDataJar() {
  // ── שיטה 1: קריאה ישירה מתיקיית Data Jar ב-iCloud ──
  try {
    const fm = FileManager.iCloud();
    // Data Jar שומר את הנתונים בתיקייה שלו ב-iCloud
    // הנתיב: /Scriptable/ExpenseTracker/expenses.json (נוצר ע"י ExpenseSync)
    // אבל גם ננסה לקרוא ישירות מ-Data Jar store
    const dataJarPaths = [
      // נתיב 1: Group container של Data Jar
      fm.joinPath(fm.libraryDirectory(), "../../../Data Jar"),
      // נתיב 2: iCloud/Data Jar
      fm.joinPath(fm.documentsDirectory(), "../../Data Jar"),
    ];
    
    // ניסיון למצוא את תיקיית Data Jar
    for (const djPath of dataJarPaths) {
      if (fm.fileExists(djPath)) {
        console.log("Found Data Jar at: " + djPath);
      }
    }
  } catch (e) {
    // לא קריטי, ממשיכים לשיטה הבאה
    console.log("Data Jar direct read not available: " + e);
  }

  // ── שיטה 2: קריאה מקובץ JSON שנוצר על ידי ExpenseSync ──
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
    console.error("Error loading from JSON file: " + e);
  }

  // החזרת מבנה ריק אם אין נתונים
  return { transactions: [], monthlyTotal: 0 };
}

// ─── פילטר עסקאות לחודש הנוכחי ────────────────────────────
function filterCurrentMonth(transactions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
}

// ─── חישוב סטטיסטיקות ─────────────────────────────────────
function calculateStats(transactions) {
  const monthlyTransactions = filterCurrentMonth(transactions);

  // סה"כ החודש
  const totalSpent = monthlyTransactions.reduce(
    (sum, t) => sum + (parseFloat(t.amount) || 0),
    0
  );

  // פירוט לפי קטגוריה
  const byCategory = {};
  monthlyTransactions.forEach((t) => {
    const cat = t.category || "✨ אחר";
    byCategory[cat] = (byCategory[cat] || 0) + (parseFloat(t.amount) || 0);
  });

  // מיון קטגוריות מהגבוהה לנמוכה
  const sortedCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, CONFIG.topCategoriesCount);

  // פירוט לפי כרטיס
  const byCard = {};
  monthlyTransactions.forEach((t) => {
    const card = t.card || "????";
    byCard[card] = (byCard[card] || 0) + (parseFloat(t.amount) || 0);
  });

  // עסקה אחרונה
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

// ─── פורמט מספר לש"ח ──────────────────────────────────────
function formatCurrency(amount) {
  return "₪" + amount.toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatCurrencyDetailed(amount) {
  return "₪" + amount.toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── צבע סכום לפי תקציב ──────────────────────────────────
function getAmountColor(spent) {
  const ratio = spent / CONFIG.monthlyBudget;
  if (ratio < 0.7) return CONFIG.colors.amountText;      // ירוק
  if (ratio < 0.9) return CONFIG.colors.amountWarning;    // כתום
  return CONFIG.colors.amountDanger;                       // אדום
}

// ─── שם חודש בעברית ───────────────────────────────────────
function getHebrewMonth() {
  const months = [
    "ינואר", "פברואר", "מרס", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
  ];
  const now = new Date();
  return months[now.getMonth()] + " " + now.getFullYear();
}

// ─── Progress Bar ─────────────────────────────────────────
function addProgressBar(stack, spent, budget, width) {
  const ratio = Math.min(spent / budget, 1.0);
  const barHeight = 6;

  const barStack = stack.addStack();
  barStack.layoutHorizontally();
  barStack.cornerRadius = barHeight / 2;
  barStack.size = new Size(width, barHeight);
  barStack.backgroundColor = CONFIG.colors.separator;

  const filledWidth = Math.max(ratio * width, 2);
  const filledBar = barStack.addStack();
  filledBar.size = new Size(filledWidth, barHeight);
  filledBar.cornerRadius = barHeight / 2;
  filledBar.backgroundColor = getAmountColor(spent);
}

// ════════════════════════════════════════════════════════════
// SMALL WIDGET (2×2)
// ════════════════════════════════════════════════════════════
function createSmallWidget(stats) {
  const widget = new ListWidget();
  widget.backgroundColor = CONFIG.colors.background;
  widget.setPadding(16, 16, 16, 16);

  // כותרת
  const titleStack = widget.addStack();
  titleStack.layoutHorizontally();
  titleStack.centerAlignContent();

  const icon = titleStack.addText("💳");
  icon.font = Font.systemFont(14);

  titleStack.addSpacer(4);

  const title = titleStack.addText("הוצאות החודש");
  title.font = Font.boldSystemFont(13);
  title.textColor = CONFIG.colors.subtitleText;

  widget.addSpacer(8);

  // סכום ראשי
  const amountText = widget.addText(formatCurrency(stats.totalSpent));
  amountText.font = Font.boldSystemFont(28);
  amountText.textColor = getAmountColor(stats.totalSpent);
  amountText.minimumScaleFactor = 0.6;

  widget.addSpacer(4);

  // Progress bar
  addProgressBar(widget, stats.totalSpent, CONFIG.monthlyBudget, 120);

  widget.addSpacer(4);

  // תקציב
  const budgetText = widget.addText(
    `מתוך ${formatCurrency(CONFIG.monthlyBudget)}`
  );
  budgetText.font = Font.systemFont(11);
  budgetText.textColor = CONFIG.colors.subtitleText;

  widget.addSpacer(4);

  // עסקה אחרונה
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

// ════════════════════════════════════════════════════════════
// MEDIUM WIDGET (4×2)
// ════════════════════════════════════════════════════════════
function createMediumWidget(stats) {
  const widget = new ListWidget();
  widget.backgroundColor = CONFIG.colors.background;
  widget.setPadding(14, 16, 14, 16);

  // ── שורה עליונה: כותרת + סכום ──
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();

  const titleLeft = headerStack.addStack();
  titleLeft.layoutHorizontally();
  titleLeft.centerAlignContent();

  const icon = titleLeft.addText("💳");
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

  // תקציב שורה
  const budgetRow = widget.addStack();
  budgetRow.layoutHorizontally();

  const countText = budgetRow.addText(
    `${stats.transactionCount} עסקאות`
  );
  countText.font = Font.systemFont(10);
  countText.textColor = CONFIG.colors.subtitleText;

  budgetRow.addSpacer();

  const budgetLabel = budgetRow.addText(
    `תקציב: ${formatCurrency(CONFIG.monthlyBudget)}`
  );
  budgetLabel.font = Font.systemFont(10);
  budgetLabel.textColor = CONFIG.colors.subtitleText;

  widget.addSpacer(6);

  // ── קו מפריד ──
  const sep = widget.addStack();
  sep.size = new Size(0, 1);
  sep.backgroundColor = CONFIG.colors.separator;

  widget.addSpacer(6);

  // ── שורת קטגוריות ──
  const catStack = widget.addStack();
  catStack.layoutHorizontally();

  if (stats.sortedCategories.length > 0) {
    stats.sortedCategories.forEach((cat, i) => {
      if (i > 0) catStack.addSpacer(8);

      const catItem = catStack.addStack();
      catItem.layoutVertically();
      catItem.centerAlignContent();

      // אימוג'י + שם קטגוריה (רק האימוג'י)
      const emoji = cat[0].split(" ")[0];
      const emojiText = catItem.addText(emoji);
      emojiText.font = Font.systemFont(16);
      emojiText.centerAlignText();

      const amtText = catItem.addText(formatCurrency(cat[1]));
      amtText.font = Font.boldSystemFont(11);
      amtText.textColor = CONFIG.colors.categoryText;
      amtText.centerAlignText();
    });
  } else {
    const noData = catStack.addText("אין עסקאות עדיין");
    noData.font = Font.systemFont(12);
    noData.textColor = CONFIG.colors.subtitleText;
  }

  catStack.addSpacer();

  widget.addSpacer(6);

  // ── שורת כרטיסים + עסקה אחרונה ──
  const bottomStack = widget.addStack();
  bottomStack.layoutHorizontally();
  bottomStack.centerAlignContent();

  // כרטיסים
  const cards = Object.entries(stats.byCard);
  if (cards.length > 0) {
    const cardsText = cards
      .map(([card, amount]) => `****${card}: ${formatCurrency(amount)}`)
      .join("  |  ");

    const cardLabel = bottomStack.addText("💳 " + cardsText);
    cardLabel.font = Font.systemFont(10);
    cardLabel.textColor = CONFIG.colors.cardIndicator;
    cardLabel.lineLimit = 1;
  }

  bottomStack.addSpacer();

  // עסקה אחרונה
  if (stats.lastTransaction) {
    const lastText = bottomStack.addText(
      `${stats.lastTransaction.merchant} ${formatCurrency(parseFloat(stats.lastTransaction.amount))}`
    );
    lastText.font = Font.systemFont(10);
    lastText.textColor = CONFIG.colors.subtitleText;
    lastText.lineLimit = 1;
  }

  return widget;
}

// ════════════════════════════════════════════════════════════
// LARGE WIDGET (4×4)
// ════════════════════════════════════════════════════════════
function createLargeWidget(stats, transactions) {
  const widget = new ListWidget();
  widget.backgroundColor = CONFIG.colors.background;
  widget.setPadding(16, 16, 16, 16);

  // ── כותרת ──
  const headerStack = widget.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();

  const icon = headerStack.addText("💳");
  icon.font = Font.systemFont(18);
  headerStack.addSpacer(6);

  const title = headerStack.addText("הוצאות " + getHebrewMonth());
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
    `${pctUsed}% מהתקציב (${formatCurrency(CONFIG.monthlyBudget)})`
  );
  pctText.font = Font.systemFont(11);
  pctText.textColor = CONFIG.colors.subtitleText;

  budgetLine.addSpacer();

  const countLabel = budgetLine.addText(
    `${stats.transactionCount} עסקאות`
  );
  countLabel.font = Font.systemFont(11);
  countLabel.textColor = CONFIG.colors.subtitleText;

  widget.addSpacer(8);

  // ── קטגוריות ──
  const catTitle = widget.addText("📂 לפי קטגוריה");
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
    catAmount.font = Font.monospacedSystemFont(12);
    catAmount.textColor = CONFIG.colors.subtitleText;

    widget.addSpacer(2);
  });

  widget.addSpacer(6);

  // ── כרטיסים ──
  const cards = Object.entries(stats.byCard);
  if (cards.length > 0) {
    const cardTitle = widget.addText("💳 לפי כרטיס");
    cardTitle.font = Font.boldSystemFont(13);
    cardTitle.textColor = CONFIG.colors.titleText;

    widget.addSpacer(4);

    cards.forEach(([card, amount]) => {
      const row = widget.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();

      const cardLabel = row.addText(`****${card}`);
      cardLabel.font = Font.monospacedSystemFont(12);
      cardLabel.textColor = CONFIG.colors.cardIndicator;

      row.addSpacer();

      const cardAmt = row.addText(formatCurrency(amount));
      cardAmt.font = Font.monospacedSystemFont(12);
      cardAmt.textColor = CONFIG.colors.subtitleText;

      widget.addSpacer(2);
    });
  }

  widget.addSpacer(6);

  // ── עסקאות אחרונות ──
  const monthlyTransactions = filterCurrentMonth(transactions);
  const recentTransactions = monthlyTransactions.slice(-5).reverse();

  if (recentTransactions.length > 0) {
    const sep2 = widget.addStack();
    sep2.size = new Size(0, 1);
    sep2.backgroundColor = CONFIG.colors.separator;

    widget.addSpacer(4);

    const recentTitle = widget.addText("📋 עסקאות אחרונות");
    recentTitle.font = Font.boldSystemFont(13);
    recentTitle.textColor = CONFIG.colors.titleText;

    widget.addSpacer(4);

    recentTransactions.forEach((t) => {
      const row = widget.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();

      const dateStr = t.date ? t.date.substring(5).replace("-", "/") : "";
      const dateLabel = row.addText(dateStr);
      dateLabel.font = Font.monospacedSystemFont(10);
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
      amtLabel.font = Font.monospacedSystemFont(11);
      amtLabel.textColor = CONFIG.colors.subtitleText;

      row.addSpacer(4);

      const emoji = (t.category || "").split(" ")[0] || "✨";
      const catEmoji = row.addText(emoji);
      catEmoji.font = Font.systemFont(11);

      row.addSpacer(4);

      const cardNum = row.addText(`****${t.card || "????"}`);
      cardNum.font = Font.monospacedSystemFont(9);
      cardNum.textColor = CONFIG.colors.cardIndicator;

      widget.addSpacer(1);
    });
  }

  return widget;
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
async function main() {
  const data = await loadExpensesFromDataJar();
  const transactions = data.transactions || [];
  const stats = calculateStats(transactions);

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

  // לחיצה על Widget → מרענן את הWidget (מריץ את הסקריפט מחדש)
  // אם רוצים לפתוח Shortcut במקום, שנה ב-Scriptable:
  // ⋯ → Widget → When Interacting → Open URL → shortcuts://run-shortcut?name=הוצאות%20שלי
  // widget.url = "shortcuts://run-shortcut?name=" + encodeURIComponent("הוצאות שלי");

  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    // תצוגה מקדימה בהרצה מתוך Scriptable
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
