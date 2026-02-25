// ============================================================
// 💾 Data Sync Helper - Scriptable Script
// ============================================================
// מקבל עסקאות מה-Shortcut ומצרף אותן לקובץ expenses.json
// 
// מה ה-Shortcut צריך לשלוח (ב-Texts):
//
//   עסקה בודדת:
//     date|time|merchant|amount|category|card|monthlyTotal
//     לדוגמה:  2026-02-25|10:30|CAFE AROMA|50|🍔 מזון|1234|170
//
//   מספר עסקאות (שורה לכל עסקה):
//     2026-02-20|09:00|SUPERSAL|120|🛒 סופר|1234
//     2026-02-22|14:30|CAFE AROMA|50|🍔 מזון|1234
//     TOTAL|170
//
//   סנכרון סה"כ בלבד:  SYNC|170
//   איפוס חודשי:        RESET|0
//
// למה טקסט ולא Dictionary?
//   כי Shortcuts לא מעביר מבנים מורכבים (List of Dicts) ל-Scriptable.
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
  // או: מספר שורות (כל שורה = עסקה, שורה אחרונה TOTAL|סכום)

  // בדוק אם יש מספר שורות (סנכרון מלא)
  const lines = input.trim().split("\n").map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length > 1) {
    // ── מצב סנכרון מלא: מספר שורות ──
    // מחליף את כל העסקאות בקובץ
    data.transactions = [];
    let newTotal = 0;

    for (const line of lines) {
      const p = line.split("|");

      if (p[0] === "TOTAL") {
        // שורה אחרונה — סה"כ
        newTotal = parseFloat(p[1]) || 0;
        continue;
      }

      if (p.length >= 6) {
        const tx = {
          date: p[0].trim(),
          time: p[1].trim(),
          merchant: p[2].trim(),
          amount: parseFloat(p[3]) || 0,
          category: p[4].trim(),
          card: p[5].trim()
        };
        data.transactions.push(tx);
        newTotal += tx.amount;
      }
    }

    data.monthlyTotal = newTotal;
    data.lastReset = data.lastReset || new Date().toISOString().split("T")[0];
    fm.writeString(filePath, JSON.stringify(data, null, 2));

    const result = "✅ סנכרון מלא | " + data.transactions.length + " עסקאות | ₪" + data.monthlyTotal;
    Script.setShortcutOutput(result);
    Script.complete();
    return;
  }

  // ── שורה בודדת ──
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

  // ── תאימות לאחור: אם הקלט הוא JSON (Dictionary מ-Shortcut ישן) ──
  try {
    const jsonData = JSON.parse(input);
    if (jsonData && (jsonData.monthlyTotal !== undefined || jsonData.transactions)) {
      // חילוץ monthlyTotal מ-Dictionary
      if (jsonData.monthlyTotal !== undefined) {
        data.monthlyTotal = parseFloat(jsonData.monthlyTotal) || 0;
      }
      // חילוץ עסקאות אם יש (בד"כ ריקות בגלל באג Shortcuts)
      if (jsonData.transactions && Array.isArray(jsonData.transactions) && jsonData.transactions.length > 0) {
        data.transactions = jsonData.transactions;
      }
      fm.writeString(filePath, JSON.stringify(data, null, 2));
      Script.setShortcutOutput("✅ Synced (JSON) | ₪" + data.monthlyTotal + " | " + data.transactions.length + " עסקאות");
      Script.complete();
      return;
    }
  } catch (e) {
    // לא JSON — ממשיך לשגיאה
  }

  // Input לא מוכר
  Script.setShortcutOutput("⚠️ פורמט לא תקין. נדרש: date|time|merchant|amount|category|card|total");
  Script.complete();
}

await syncData();
