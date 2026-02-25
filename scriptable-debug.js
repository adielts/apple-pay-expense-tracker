// ============================================================
// 🔧 Debug Script — הרץ ישירות מ-Scriptable
// ============================================================
// סקריפט זה:
// 1. כותב נתוני טסט לקובץ expenses.json
// 2. קורא אותם בחזרה
// 3. מציג הכל על המסך
// 4. מוודא שה-Widget יכול לקרוא את הקובץ
// ============================================================

async function debug() {
  const fm = FileManager.iCloud();
  const dir = fm.documentsDirectory();
  const trackerDir = fm.joinPath(dir, "ExpenseTracker");
  
  let log = [];
  log.push("📁 Documents dir: " + dir);
  log.push("📁 Tracker dir: " + trackerDir);
  log.push("📁 Tracker exists: " + fm.fileExists(trackerDir));
  
  // יצירת תיקייה אם לא קיימת
  if (!fm.fileExists(trackerDir)) {
    fm.createDirectory(trackerDir, true);
    log.push("✅ Created tracker directory");
  }
  
  const filePath = fm.joinPath(trackerDir, "expenses.json");
  log.push("📄 File path: " + filePath);
  log.push("📄 File exists (before): " + fm.fileExists(filePath));
  
  // נתוני טסט
  const testData = {
    transactions: [
      {
        date: "2026-02-25",
        time: "10:00",
        merchant: "TEST CAFE",
        amount: 50,
        category: "🍔 מזון",
        card: "1234"
      },
      {
        date: "2026-02-25",
        time: "12:30",
        merchant: "TEST SHOP",
        amount: 120,
        category: "🛒 קניות",
        card: "5678"
      }
    ],
    monthlyTotal: 170,
    lastReset: "2026-02-01"
  };
  
  // כתיבה
  try {
    const jsonString = JSON.stringify(testData, null, 2);
    fm.writeString(filePath, jsonString);
    log.push("✅ Written " + jsonString.length + " bytes");
  } catch (e) {
    log.push("❌ Write error: " + e);
  }
  
  // קריאה חזרה
  try {
    if (fm.fileExists(filePath)) {
      await fm.downloadFileFromiCloud(filePath);
      const raw = fm.readString(filePath);
      const parsed = JSON.parse(raw);
      log.push("✅ Read back OK");
      log.push("📊 Transactions: " + parsed.transactions.length);
      log.push("💰 Monthly total: ₪" + parsed.monthlyTotal);
      parsed.transactions.forEach((t, i) => {
        log.push("   [" + i + "] " + t.merchant + " | ₪" + t.amount + " | " + t.category);
      });
    } else {
      log.push("❌ File not found after write!");
    }
  } catch (e) {
    log.push("❌ Read error: " + e);
  }
  
  // בדיקה מה args מכילים (לדיבוג של Shortcut input)
  log.push("");
  log.push("── Shortcut Args ──");
  log.push("shortcutParameter: " + JSON.stringify(args.shortcutParameter));
  log.push("plainTexts: " + JSON.stringify(args.plainTexts));
  log.push("queryParameters: " + JSON.stringify(args.queryParameters));
  log.push("widgetParameter: " + JSON.stringify(args.widgetParameter));
  
  // הצגת תוצאות
  const output = log.join("\n");
  
  const alert = new Alert();
  alert.title = "🔧 Debug Results";
  alert.message = output;
  alert.addAction("OK");
  alert.addCancelAction("Copy to Clipboard");
  const choice = await alert.present();
  
  if (choice === -1) {
    Pasteboard.copy(output);
  }
  
  console.log(output);
  return output;
}

await debug();
Script.complete();
