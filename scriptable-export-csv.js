// ============================================================
// 📤 CSV Export Helper - Scriptable Script
// ============================================================
// מייצא את עסקאות החודש לקובץ CSV
// מופעל מתוך Shortcut "אפס חודש"
//
// פלט (טקסט): OK|count|total|month  או  ERROR|הודעה
// ============================================================

// פענוח תאריך (תומך ב-dd-MM-yyyy וגם yyyy-MM-dd)
function parseDate(dateStr) {
  if (!dateStr) return new Date(NaN);
  const ddmmyyyy = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
  }
  return new Date(dateStr);
}

async function exportCSV() {
  const fm = FileManager.iCloud();
  const dir = fm.documentsDirectory();

  // קריאת נתונים
  const trackerDir = fm.joinPath(dir, "ExpenseTracker");
  const filePath = fm.joinPath(trackerDir, "expenses.json");

  if (!fm.fileExists(filePath)) {
    Script.setShortcutOutput("ERROR|No data file found");
    Script.complete();
    return;
  }

  await fm.downloadFileFromiCloud(filePath);
  const data = JSON.parse(fm.readString(filePath));
  const transactions = data.transactions || [];

  if (transactions.length === 0) {
    Script.setShortcutOutput("ERROR|No transactions to export");
    Script.complete();
    return;
  }

  // סינון חודש נוכחי
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const d = parseDate(t.date);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  if (monthlyTransactions.length === 0) {
    Script.setShortcutOutput("ERROR|No transactions this month");
    Script.complete();
    return;
  }

  // יצירת CSV
  const BOM = "\uFEFF"; // BOM for Hebrew support in Excel
  let csv = BOM + "תאריך,שעה,עסק,סכום,קטגוריה,כרטיס\n";

  monthlyTransactions.forEach((t) => {
    const row = [
      t.date || "",
      t.time || "",
      `"${(t.merchant || "").replace(/"/g, '""')}"`,
      t.amount || 0,
      `"${(t.category || "").replace(/"/g, '""')}"`,
      `"****${t.card || "????"}"`,
    ].join(",");
    csv += row + "\n";
  });

  // סה"כ
  const total = monthlyTransactions.reduce(
    (sum, t) => sum + (parseFloat(t.amount) || 0),
    0
  );
  csv += `\n,,סה"כ,${total.toFixed(2)},,\n`;

  // שמירת קובץ CSV
  const monthNames = [
    "01-ינואר", "02-פברואר", "03-מרס", "04-אפריל",
    "05-מאי", "06-יוני", "07-יולי", "08-אוגוסט",
    "09-ספטמבר", "10-אוקטובר", "11-נובמבר", "12-דצמבר",
  ];

  const backupDir = fm.joinPath(trackerDir, "גיבויים");
  if (!fm.fileExists(backupDir)) {
    fm.createDirectory(backupDir, true);
  }

  const fileName = `הוצאות-${currentYear}-${monthNames[currentMonth]}.csv`;
  const csvPath = fm.joinPath(backupDir, fileName);
  fm.writeString(csvPath, csv);

  Script.setShortcutOutput(
    "OK|" + monthlyTransactions.length + "|" + total.toFixed(2) + "|" + monthNames[currentMonth]
  );
  Script.complete();
}

await exportCSV();
