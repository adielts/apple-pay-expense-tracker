// Debug: מציג את תוכן expenses.json כפי שהוידג'ט רואה אותו
const fm = FileManager.iCloud();
const dir = fm.documentsDirectory();
const filePath = fm.joinPath(dir, "ExpenseTracker/expenses.json");

let msg = "";

if (fm.fileExists(filePath)) {
  await fm.downloadFileFromiCloud(filePath);
  const raw = fm.readString(filePath);
  const data = JSON.parse(raw);
  
  msg += "monthlyTotal: " + data.monthlyTotal + "\n";
  msg += "transactions: " + (data.transactions ? data.transactions.length : "MISSING") + "\n";
  msg += "lastReset: " + (data.lastReset || "none") + "\n\n";
  
  if (data.transactions && data.transactions.length > 0) {
    // הצג כל עסקה
    data.transactions.forEach((t, i) => {
      msg += (i+1) + ". " + t.date + " | " + t.merchant + " | ₪" + t.amount + " | " + t.category + "\n";
    });
    
    // בדוק פילטר חודש נוכחי
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();
    msg += "\n--- Filter Test (month=" + (cm+1) + "/" + cy + ") ---\n";
    
    data.transactions.forEach((t, i) => {
      const d = new Date(t.date);
      const pass = d.getMonth() === cm && d.getFullYear() === cy;
      msg += (i+1) + ". date='" + t.date + "' → parsed=" + d.toISOString().split("T")[0] + " → month=" + (d.getMonth()+1) + " → " + (pass ? "✅ PASS" : "❌ FAIL") + "\n";
    });
  }
} else {
  msg = "❌ expenses.json NOT FOUND";
}

const a = new Alert();
a.title = "File Debug";
a.message = msg;
a.addAction("OK");
await a.present();
