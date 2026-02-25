// ============================================================
// 💾 Data Sync Helper - Scriptable Script
// ============================================================
// סקריפט עזר שמופעל מה-Shortcut אחרי כל עסקה
// מייצא את הנתונים מ-Data Jar לקובץ JSON
// שה-Widget יכול לקרוא
// ============================================================

async function syncData() {
  const fm = FileManager.iCloud();
  const dir = fm.documentsDirectory();
  const trackerDir = fm.joinPath(dir, "ExpenseTracker");

  // וודא שהתיקייה קיימת
  if (!fm.fileExists(trackerDir)) {
    fm.createDirectory(trackerDir, true);
  }

  const filePath = fm.joinPath(trackerDir, "expenses.json");

  // קבלת נתונים מ-Shortcut דרך פרמטר
  let inputData;

  if (args.shortcutParameter) {
    // אם הופעל מ-Shortcut עם פרמטר JSON
    inputData = args.shortcutParameter;
  } else if (args.plainTexts && args.plainTexts.length > 0) {
    // אם הופעל עם טקסט
    try {
      inputData = JSON.parse(args.plainTexts[0]);
    } catch (e) {
      console.error("Failed to parse input: " + e);
    }
  }

  if (!inputData) {
    // ── הופעל ישירות מ-Scriptable (בלי Shortcut) ──
    // שלוף נתונים מ-Data Jar דרך URL callback
    try {
      const callbackURL = "datajar:///get?keypath=expenses";
      const cbResult = await CallbackURL.open(callbackURL);
      if (cbResult && cbResult.result) {
        inputData = JSON.parse(cbResult.result);
      }
    } catch (e) {
      console.log("Data Jar callback failed: " + e);
      console.log("טיפ: הפעל את ExpenseSync מתוך Shortcut, או בדוק שה-Data Jar מותקן.");
    }
  }

  if (inputData) {
    // כתיבת נתונים חדשים
    const jsonString = JSON.stringify(inputData, null, 2);
    fm.writeString(filePath, jsonString);
    return "OK: Data synced successfully";
  }

  // אם אין input, קרא נתונים קיימים
  if (fm.fileExists(filePath)) {
    await fm.downloadFileFromiCloud(filePath);
    const raw = fm.readString(filePath);
    return raw;
  }

  // קובץ לא קיים - החזר מבנה ריק
  const emptyData = {
    transactions: [],
    monthlyTotal: 0,
    lastReset: new Date().toISOString().split("T")[0],
  };

  fm.writeString(filePath, JSON.stringify(emptyData, null, 2));
  return JSON.stringify(emptyData);
}

const result = await syncData();
Script.setShortcutOutput(result);
Script.complete();
