// ============================================================
// 🔧 Widget Debug — שים כ-Widget על מסך הבית
// ============================================================
// מציג בדיוק מה ה-Widget רואה כשהוא רץ
// ============================================================

async function createDebugWidget() {
  const widget = new ListWidget();
  widget.backgroundColor = new Color("#1C1C1E");
  
  let lines = [];
  
  try {
    const fm = FileManager.iCloud();
    const dir = fm.documentsDirectory();
    const trackerDir = fm.joinPath(dir, "ExpenseTracker");
    const filePath = fm.joinPath(trackerDir, "expenses.json");
    
    lines.push("Dir: OK");
    lines.push("Exists: " + fm.fileExists(filePath));
    
    if (fm.fileExists(filePath)) {
      // נסה בלי downloadFileFromiCloud קודם
      try {
        const raw = fm.readString(filePath);
        if (raw) {
          const data = JSON.parse(raw);
          const txCount = (data.transactions || []).length;
          const total = data.monthlyTotal || 0;
          lines.push("Read: OK (" + raw.length + "b)");
          lines.push("TX: " + txCount);
          lines.push("Total: ₪" + total);
          
          // בדוק פילטר חודשי
          const now = new Date();
          const cm = now.getMonth();
          const cy = now.getFullYear();
          let monthlyCount = 0;
          let monthlySum = 0;
          (data.transactions || []).forEach(t => {
            const d = new Date(t.date);
            if (d.getMonth() === cm && d.getFullYear() === cy) {
              monthlyCount++;
              monthlySum += parseFloat(t.amount) || 0;
            }
          });
          lines.push("Monthly: " + monthlyCount + " tx");
          lines.push("MonthSum: ₪" + monthlySum);
        } else {
          lines.push("Read: EMPTY");
        }
      } catch (readErr) {
        lines.push("Read err: " + readErr.message);
        
        // נסה עם download
        try {
          await fm.downloadFileFromiCloud(filePath);
          const raw2 = fm.readString(filePath);
          lines.push("DL+Read: " + (raw2 ? raw2.length + "b" : "EMPTY"));
        } catch (dlErr) {
          lines.push("DL err: " + dlErr.message);
        }
      }
    } else {
      lines.push("FILE NOT FOUND");
    }
  } catch (e) {
    lines.push("ERROR: " + e.message);
  }
  
  // הצגת כל השורות
  lines.forEach(line => {
    const t = widget.addText(line);
    t.textColor = Color.white();
    t.font = Font.systemFont(11);
  });
  
  return widget;
}

const widget = await createDebugWidget();

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentMedium();
}

Script.complete();
