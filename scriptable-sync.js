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
    // שלוף נתונים מ-Data Jar דרך x-callback-url
    try {
      const cb = new CallbackURL("datajar:///x-callback-url/get");
      cb.addParameter("keypath", "expenses");
      const cbResult = await cb.open();
      if (cbResult && cbResult.result) {
        // Data Jar מחזיר את הערך ב-result
        const parsed = typeof cbResult.result === "string" 
          ? JSON.parse(cbResult.result) 
          : cbResult.result;
        if (parsed) {
          inputData = parsed;
        }
      }
    } catch (e) {
      console.log("Data Jar callback failed: " + e);
      // ── Fallback: נסה לקרוא מקובץ קיים ──
      if (fm.fileExists(filePath)) {
        await fm.downloadFileFromiCloud(filePath);
        const raw = fm.readString(filePath);
        console.log("Loaded existing expenses.json");
        return raw;
      }
      console.log("טיפ: הפעל את ExpenseSync מתוך ה-Shortcut 'תעד עסקה' או 'הוצאות שלי'.");
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
