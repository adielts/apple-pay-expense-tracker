// ============================================================
// 💾 Data Sync Helper - Scriptable Script
// ============================================================
// סקריפט עזר שמופעל מתוך Shortcut בלבד!
// מקבל את נתוני expenses מה-Shortcut וכותב לקובץ JSON
// שה-Widget יכול לקרוא.
// 
// ⚠️ אי אפשר להריץ ישירות מ-Scriptable — חייב להפעיל
// מתוך Shortcut שמעביר את הנתונים מ-Data Jar.
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
    inputData = args.shortcutParameter;
  } else if (args.plainTexts && args.plainTexts.length > 0) {
    try {
      inputData = JSON.parse(args.plainTexts[0]);
    } catch (e) {
      // אולי זה כבר אובייקט
      inputData = args.plainTexts[0];
    }
  } else if (args.queryParameters && args.queryParameters.data) {
    try {
      inputData = JSON.parse(args.queryParameters.data);
    } catch (e) {
      inputData = args.queryParameters.data;
    }
  }

  if (inputData) {
    // כתיבת נתונים לקובץ
    const jsonString = JSON.stringify(inputData, null, 2);
    fm.writeString(filePath, jsonString);
    
    // ספירת עסקאות לאישור
    let count = 0;
    try {
      const parsed = typeof inputData === "string" ? JSON.parse(inputData) : inputData;
      count = (parsed.transactions || []).length;
    } catch (e) {}
    
    return "✅ סנכרון הצליח! " + count + " עסקאות נכתבו לקובץ.";
  }

  // אין input — הופעל ישירות מ-Scriptable
  if (fm.fileExists(filePath)) {
    await fm.downloadFileFromiCloud(filePath);
    const raw = fm.readString(filePath);
    let count = 0;
    try {
      count = (JSON.parse(raw).transactions || []).length;
    } catch (e) {}
    return "ℹ️ קובץ קיים עם " + count + " עסקאות. לעדכון — הפעל דרך Shortcut 'הוצאות שלי' → '🔄 סנכרון Widget'.";
  }

  return "⚠️ אין נתונים. הפעל את Shortcut 'הוצאות שלי' → '🔄 סנכרון Widget' כדי לסנכרן מ-Data Jar.";
}

const result = await syncData();

// הצגת הודעה למשתמש אם הופעל מתוך Scriptable ישירות
if (!config.runsInWidget && !args.shortcutParameter) {
  const alert = new Alert();
  alert.title = "ExpenseSync";
  alert.message = result;
  alert.addAction("OK");
  await alert.present();
}

Script.setShortcutOutput(result);
Script.complete();
