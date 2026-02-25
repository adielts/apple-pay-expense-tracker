// ============================================================
// 💾 Data Sync Helper - Scriptable Script
// ============================================================
// מקבל עסקה בודדת מה-Shortcut ומצרף אותה לקובץ expenses.json
// 
// מה ה-Shortcut צריך לשלוח (ב-Texts):
//   שורה בפורמט: date|time|merchant|amount|category|card|monthlyTotal
//   לדוגמה:  2026-02-25|10:30|CAFE AROMA|50|🍔 מזון|1234|170
//
//   לסנכרון סה"כ בלבד:  SYNC|170
//   לאיפוס חודשי:        RESET|0
//
// למה טקסט ולא Dictionary?
//   כי Shortcuts לא מעביר מבנים מורכבים (List of Dicts) ל-Scriptable בצורה תקינה.
//   טקסט פשוט תמיד עובד.
// ============================================================

async function syncData() {
  const fm = FileManager.iCloud();
  const dir = fm.documentsDirectory();
  const trackerDir = fm.joinPath(dir, "ExpenseTracker");

  if (!fm.fileExists(trackerDir)) {
    fm.createDirectory(trackerDir, true);
  }

  const filePath = fm.joinPath(trackerDir, "expenses.json");

  // קריאת נתונים קיימים
  let data = { transactions: [], monthlyTotal: 0, lastReset: "" };
  if (fm.fileExists(filePath)) {
    try {
      await fm.downloadFileFromiCloud(filePath);
      const raw = fm.readString(filePath);
      if (raw) {
        data = JSON.parse(raw);
        if (!data.transactions) data.transactions = [];
      }
    } catch (e) {
      console.log("Could not read existing file: " + e);
    }
  }

  // קבלת Input מ-Shortcut
  let input = null;
  if (args.plainTexts && args.plainTexts.length > 0) {
    input = args.plainTexts[0];
  } else if (args.shortcutParameter) {
    input = String(args.shortcutParameter);
  }

  if (!input || input.trim() === "") {
    // הופעל ללא input — הצג סטטוס
    const msg = "ℹ️ " + data.transactions.length + " עסקאות | ₪" + (data.monthlyTotal || 0) + "\n\nלסנכרון: הפעל דרך Shortcut.";
    if (!config.runsInWidget) {
      const a = new Alert();
      a.title = "ExpenseSync";
      a.message = msg;
      a.addAction("OK");
      await a.present();
    }
    Script.setShortcutOutput(msg);
    Script.complete();
    return;
  }

  // פענוח הקלט — פורמט: date|time|merchant|amount|category|card|monthlyTotal
  // או: RESET|monthlyTotal  (לאיפוס)
  // או: SYNC|monthlyTotal   (סנכרון סה"כ בלבד)
  const parts = input.split("|");

  if (parts[0] === "RESET") {
    // איפוס — רק מעדכן monthlyTotal
    data.monthlyTotal = parseFloat(parts[1]) || 0;
    fm.writeString(filePath, JSON.stringify(data, null, 2));
    Script.setShortcutOutput("✅ Total reset to ₪" + data.monthlyTotal);
    Script.complete();
    return;
  }

  if (parts[0] === "SYNC") {
    // סנכרון — עדכון monthlyTotal ללא הוספת עסקה
    data.monthlyTotal = parseFloat(parts[1]) || 0;
    fm.writeString(filePath, JSON.stringify(data, null, 2));
    Script.setShortcutOutput("✅ Synced | ₪" + data.monthlyTotal + " | " + data.transactions.length + " עסקאות");
    Script.complete();
    return;
  }

  if (parts.length >= 6) {
    // עסקה חדשה
    const newTx = {
      date: parts[0].trim(),
      time: parts[1].trim(),
      merchant: parts[2].trim(),
      amount: parseFloat(parts[3]) || 0,
      category: parts[4].trim(),
      card: parts[5].trim()
    };

    data.transactions.push(newTx);

    // עדכון monthlyTotal
    if (parts.length >= 7 && parts[6].trim() !== "") {
      data.monthlyTotal = parseFloat(parts[6]) || 0;
    } else {
      data.monthlyTotal = (data.monthlyTotal || 0) + newTx.amount;
    }

    data.lastReset = data.lastReset || new Date().toISOString().split("T")[0];

    // כתיבה
    fm.writeString(filePath, JSON.stringify(data, null, 2));

    const result = "✅ " + newTx.merchant + " | ₪" + newTx.amount + " | סה\"כ: ₪" + data.monthlyTotal + " | " + data.transactions.length + " עסקאות";
    Script.setShortcutOutput(result);
    Script.complete();
    return;
  }

  // Input לא מוכר
  Script.setShortcutOutput("⚠️ פורמט לא תקין. נדרש: date|time|merchant|amount|category|card|total");
  Script.complete();
}

await syncData();
