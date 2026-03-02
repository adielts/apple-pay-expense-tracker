// Debug: מציג את תוכן expenses.json כפי שהוידג'ט רואה אותו

// parseDate — תומך ב-dd-MM-yyyy וגם yyyy-MM-dd
function parseDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  // dd-MM-yyyy  או  dd/MM/yyyy
  const dmy = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
  // yyyy-MM-dd
  const ymd = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (ymd) return new Date(+ymd[1], +ymd[2] - 1, +ymd[3]);
  return new Date(s);
}

const fm = FileManager.iCloud();
const dir = fm.documentsDirectory();
const filePath = fm.joinPath(dir, "ExpenseTracker/expenses.json");

let msg = "";

if (fm.fileExists(filePath)) {
  await fm.downloadFileFromiCloud(filePath);
  const raw = fm.readString(filePath);
  const data = JSON.parse(raw);
  
  const now = new Date();
  const cm = now.getMonth();
  const cy = now.getFullYear();
  
  msg += "📅 Now: " + now.toISOString().split("T")[0] + " (month " + (cm+1) + ")\n";
  msg += "💰 monthlyTotal: ₪" + data.monthlyTotal + "\n";
  msg += "📊 transactions: " + (data.transactions ? data.transactions.length : "MISSING") + "\n";
  msg += "🔄 lastReset: " + (data.lastReset || "none") + "\n\n";
  
  if (data.transactions && data.transactions.length > 0) {
    // הצג כל עסקה + פילטר
    let passCount = 0;
    let passTotal = 0;
    
    data.transactions.forEach((t, i) => {
      const d = parseDate(t.date);
      const pass = d && d.getMonth() === cm && d.getFullYear() === cy;
      if (pass) { passCount++; passTotal += parseFloat(t.amount) || 0; }
      const parsed = d ? (d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear()) : "INVALID";
      msg += (pass ? "✅" : "❌") + " " + (i+1) + ". " + t.date + " → " + parsed + " | " + t.merchant + " | ₪" + t.amount + "\n";
    });
    
    msg += "\n--- סיכום חודש " + (cm+1) + " ---\n";
    msg += "✅ " + passCount + " עסקאות | ₪" + passTotal.toFixed(2) + "\n";
    msg += "❌ " + (data.transactions.length - passCount) + " לא בחודש הנוכחי\n";
  } else {
    msg += "אין עסקאות בקובץ\n";
  }
} else {
  msg = "❌ expenses.json NOT FOUND\nat: " + filePath;
}

const a = new Alert();
a.title = "File Debug";
a.message = msg;
a.addAction("OK");
await a.present();
