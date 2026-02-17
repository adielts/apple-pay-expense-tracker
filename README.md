# 💳 מעקב הוצאות אשראי — iOS Shortcuts

> מערכת מעקב הוצאות אוטומטית לאייפון, מבוססת Apple Pay Transaction Trigger
> 
> תואם **iOS 26**

---

## 📋 תוכן עניינים

1. [דרישות מקדימות](#-דרישות-מקדימות)
2. [שלב 1: הגדרת Data Jar](#-שלב-1-הגדרת-data-jar)
3. [שלב 2: הגדרת Scriptable](#-שלב-2-הגדרת-scriptable)
4. [שלב 3: Shortcut — תעד עסקה (אוטומציה)](#-שלב-3-shortcut--תעד-עסקה-אוטומציה)
5. [שלב 4: Shortcut — הוצאות שלי (צפייה)](#-שלב-4-shortcut--הוצאות-שלי-צפייה)
6. [שלב 5: Shortcut — אפס חודש](#-שלב-5-shortcut--אפס-חודש)
7. [שלב 6: וידג'ט על מסך הבית](#-שלב-6-וידגט-על-מסך-הבית)
8. [פתרון בעיות](#-פתרון-בעיות)

---

## 📱 דרישות מקדימות

| אפליקציה | עלות | קישור |
|-----------|-------|--------|
| **iOS 26** | מובנה | בדוק: הגדרות → כללי → אודות |
| **Shortcuts** | מובנה | כבר מותקן |
| **Data Jar** | חינם | [App Store](https://apps.apple.com/app/data-jar/id1453273600) |
| **Scriptable** | חינם | [App Store](https://apps.apple.com/app/scriptable/id1405459188) |
| **Apple Pay** | מובנה | לפחות כרטיס אחד מוגדר ב-Wallet |

### ⚠️ חשוב לפני שמתחילים
- וודא שיש לך **Apple Pay מוגדר** עם לפחות כרטיס אחד
- וודא ש-**iCloud** מופעל (הגדרות → Apple ID → iCloud)
- התקן את **Data Jar** ו-**Scriptable** מה-App Store

---

## 📦 שלב 1: הגדרת Data Jar

### 1.1 יצירת מבנה נתונים

פתח את **Data Jar** וצור את הערכים הבאים:

#### ערך 1: `expenses` (Dictionary)
1. לחץ על **+** (פלוס) בפינה הימנית העליונה
2. בחר **Dictionary**
3. שם: `expenses`
4. בתוכו צור:
   - מפתח `transactions` → סוג **List** (ריק)
   - מפתח `monthlyTotal` → סוג **Number** → ערך `0`
   - מפתח `lastReset` → סוג **Text** → ערך `2026-02-17`

#### ערך 2: `merchantMap` (Dictionary)
1. לחץ **+** → **Dictionary**
2. שם: `merchantMap`
3. השאר ריק (ימולא אוטומטית בשימוש)

#### ערך 3: `categories` (List)
1. לחץ **+** → **List**
2. שם: `categories`
3. הוסף את הפריטים הבאים (כל אחד כ-Text):

```
🍔 מזון
⛽ דלק
🛒 קניות
🎬 בילויים
🏥 בריאות
🚗 תחבורה
📱 תקשורת
🏠 בית
✨ אחר
```

### 1.2 בדיקה
המבנה ב-Data Jar צריך להיראות כך:
```
📁 Data Jar
├─ 📂 expenses (Dictionary)
│   ├─ 📋 transactions (List) — ריק
│   ├─ 🔢 monthlyTotal — 0
│   └─ 📝 lastReset — "2026-02-17"
├─ 📂 merchantMap (Dictionary) — ריק
└─ 📋 categories (List) — 9 פריטים
```

---

## 🔧 שלב 2: הגדרת Scriptable

### 2.1 העתקת סקריפטים

יש **3 סקריפטים** להעתיק לתוך Scriptable:

#### סקריפט 1: `ExpenseWidget`
1. פתח **Scriptable**
2. לחץ **+** ליצירת סקריפט חדש
3. שנה את השם ל- **`ExpenseWidget`** (לחיצה על השם למעלה)
4. מחק את כל התוכן
5. העתק והדבק את כל התוכן מהקובץ: **`scriptable-widget.js`**
6. לחץ **Done**

#### סקריפט 2: `ExpenseSync`
1. לחץ **+** ליצירת סקריפט חדש
2. שם: **`ExpenseSync`**
3. העתק והדבק מהקובץ: **`scriptable-sync.js`**
4. לחץ **Done**

#### סקריפט 3: `ExpenseExportCSV`
1. לחץ **+** ליצירת סקריפט חדש
2. שם: **`ExpenseExportCSV`**
3. העתק והדבק מהקובץ: **`scriptable-export-csv.js`**
4. לחץ **Done**

### 2.2 הגדרת תקציב (אופציונלי)
1. פתח את סקריפט **ExpenseWidget** בעריכה
2. מצא את השורה `monthlyBudget: 5000`
3. שנה ל-תקציב החודשי שלך
4. שמור

---

## ⚡ שלב 3: Shortcut — תעד עסקה (אוטומציה)

> זהו ה-Shortcut העיקרי — מופעל **אוטומטית** בכל פעם שמגהצים עם Apple Pay

### 3.1 יצירת האוטומציה

1. פתח **Shortcuts** (קיצורים)
2. לחץ על לשונית **Automation** (אוטומציה) בתחתית
3. לחץ **+** → בקטגוריה **Wallet** בחר **When I Tap** (כשאני מגהץ)
4. בחר **Any Card** (כל כרטיס) — כך כל הכרטיסים יתועדו
5. בחר **Run Immediately** (הפעל מיד)
6. כבה את **Notify When Run** (נשלח notification משלנו)
7. לחץ **Next** (הבא)

### 3.2 איך מגיעים לנתוני העסקה מהטריגר

כשהטריגר **When I Tap** מופעל, הוא מעביר **Shortcut Input** עם השדות הבאים:
- **Amount** — סכום העסקה (מספר)
- **Merchant** — שם העסק (טקסט)
- **Currency Code** — מטבע (למשל ILS)
- **Card Number** — 4 ספרות אחרונות של הכרטיס

**איך לבחור שדה מהטריגר:**
1. בפעולת **Set Variable** → לחץ על שדה **Value**
2. בשורת המשתנים מעל המקלדת → לחץ על **Shortcut Input**
3. לחץ עליו **שוב** (או על החץ) כדי לפתוח את רשימת השדות
4. בחר את השדה הרצוי (Amount / Merchant / Card Number)

### 3.3 בניית הזרימה — פעולה אחר פעולה

> **חשוב:** הוסף כל פעולה בסדר המדויק. חפש את שם הפעולה בשורת החיפוש בתחתית המסך.

---

#### פעולה 1: `Format Date` — תאריך

חפש והוסף: **Format Date**

- **Date**: לחץ על השדה → בחר **Current Date**
- **Date Format**: לחץ ובחר **Custom Format**
- **Format String**: הקלד `yyyy-MM-dd`

---

#### פעולה 2: `Set Variable` — שמירת תאריך

חפש והוסף: **Set Variable**

- **Variable Name**: הקלד `todayDate`
- **Value**: לחץ → בחר את התוצאה של **Format Date** (פעולה 1)

---

#### פעולה 3: `Format Date` — שעה

חפש והוסף: **Format Date**

- **Date**: **Current Date**
- **Date Format**: **Custom Format**
- **Format String**: `HH:mm`

---

#### פעולה 4: `Set Variable` — שמירת שעה

**Set Variable**

- **Variable Name**: `currentTime`
- **Value**: תוצאת **Format Date** (פעולה 3)

---

#### פעולה 5: `Set Variable` — סכום העסקה

**Set Variable**

- **Variable Name**: `transactionAmount`
- **Value**: לחץ → **Shortcut Input** → לחץ שוב → בחר **Amount**

---

#### פעולה 6: `Set Variable` — שם העסק

**Set Variable**

- **Variable Name**: `merchantName`
- **Value**: לחץ → **Shortcut Input** → **Merchant**

---

#### פעולה 7: `Set Variable` — מספר כרטיס

**Set Variable**

- **Variable Name**: `cardNumber`
- **Value**: לחץ → **Shortcut Input** → **Card Number**

---

#### פעולה 8: `Get Value` (Data Jar) — טעינת עסקים מוכרים

חפש: **Data Jar** → בחר **Get Value**

- **Key Path**: הקלד `merchantMap`

---

#### פעולה 9: `Set Variable` — שמירת עסקים מוכרים

**Set Variable**

- **Variable Name**: `knownMerchants`
- **Value**: תוצאת **Get Value** (פעולה 8)

---

#### פעולה 10: `Get Dictionary Value` — בדיקה אם העסק ידוע

חפש והוסף: **Get Dictionary Value**

- **Dictionary**: לחץ → בחר משתנה **`knownMerchants`**
- **Key**: לחץ → בחר משתנה **`merchantName`**

---

#### פעולה 11: `Set Variable` — קטגוריה אוטומטית

**Set Variable**

- **Variable Name**: `autoCategory`
- **Value**: תוצאת **Get Dictionary Value** (פעולה 10)

---

#### פעולה 12: `If` — האם העסק מוכר?

חפש והוסף: **If**

- **Input**: לחץ → בחר משתנה **`autoCategory`**
- **Condition**: בחר **has any value**

---

#### 🟢 בתוך ענף ה-If (עסק מוכר):

#### פעולה 13: `Set Variable`

**Set Variable**

- **Variable Name**: `selectedCategory`
- **Value**: לחץ → בחר משתנה **`autoCategory`**

> עסק מוכר → לוקח את הקטגוריה שנשמרה → **0 לחיצות!**

---

#### פעולה 14: `Otherwise`

> (כבר קיים כחלק מה-If — גלול אליו)

---

#### 🔴 בתוך ענף ה-Otherwise (עסק חדש):

#### פעולה 15: `Get Value` (Data Jar)

**Data Jar** → **Get Value**

- **Key Path**: `categories`

---

#### פעולה 16: `Set Variable`

**Set Variable**

- **Variable Name**: `categoryList`
- **Value**: תוצאת **Get Value** (פעולה 15)

---

#### פעולה 17: `Choose from List`

חפש והוסף: **Choose from List**

- **List**: לחץ → בחר משתנה **`categoryList`**
- **Prompt**: הקלד `📁 בחר קטגוריה עבור: ` ואז לחץ ובחר משתנה **`merchantName`**

---

#### פעולה 18: `Set Variable`

**Set Variable**

- **Variable Name**: `selectedCategory`
- **Value**: **Chosen Item** (תוצאת Choose from List, פעולה 17)

---

#### פעולה 19: `Set Value` (Data Jar) — לימוד העסק

**Data Jar** → **Set Value**

- **Key Path**: הקלד `merchantMap/` ואז לחץ ובחר משתנה **`merchantName`**
  - צריך להיראות: `merchantMap/`**[merchantName]**
- **Value**: לחץ → בחר משתנה **`selectedCategory`**

> **כך המערכת לומדת!** בפעם הבאה שתגהץ באותו עסק — קטגוריה אוטומטית, 0 לחיצות.

---

#### פעולה 20: `End If`

> (כבר קיים כחלק מה-If)

---

**⬇️ הפעולות הבאות מחוץ ל-If — אחרי End If:**

---

#### פעולה 21: `Dictionary` — יצירת אובייקט עסקה

חפש והוסף: **Dictionary**

לחץ **Add new item** והוסף 6 שורות:

| Key | Type | Value — מה לבחור |
|-----|------|-------------------|
| `date` | Text | לחץ → בחר משתנה **`todayDate`** |
| `time` | Text | לחץ → בחר משתנה **`currentTime`** |
| `merchant` | Text | לחץ → בחר משתנה **`merchantName`** |
| `amount` | Number | לחץ → בחר משתנה **`transactionAmount`** |
| `category` | Text | לחץ → בחר משתנה **`selectedCategory`** |
| `card` | Text | לחץ → בחר משתנה **`cardNumber`** |

---

#### פעולה 22: `Set Variable`

**Set Variable**

- **Variable Name**: `newTransaction`
- **Value**: תוצאת **Dictionary** (פעולה 21)

---

#### פעולה 23: `Add to List` (Data Jar) — שמירת העסקה

חפש: **Data Jar** → **Add to List**

- **Value**: לחץ → בחר משתנה **`newTransaction`**
- **Key Path**: הקלד `expenses/transactions`

---

#### פעולה 24: `Get Value` (Data Jar) — סה"כ נוכחי

**Data Jar** → **Get Value**

- **Key Path**: `expenses/monthlyTotal`

---

#### פעולה 25: `Set Variable`

**Set Variable**

- **Variable Name**: `currentTotal`
- **Value**: תוצאת **Get Value** (פעולה 24)

---

#### פעולה 26: `Calculate` — חישוב סה"כ חדש

חפש והוסף: **Calculate**

- **Input**: לחץ → בחר משתנה **`currentTotal`**
- **Operation**: **+** (חיבור)
- **Operand**: לחץ → בחר משתנה **`transactionAmount`**

---

#### פעולה 27: `Set Variable`

**Set Variable**

- **Variable Name**: `newTotal`
- **Value**: תוצאת **Calculate** (פעולה 26)

---

#### פעולה 28: `Set Value` (Data Jar) — שמירת סה"כ חדש

**Data Jar** → **Set Value**

- **Key Path**: `expenses/monthlyTotal`
- **Value**: לחץ → בחר משתנה **`newTotal`**

---

#### פעולה 29: `Get Value` (Data Jar) — טעינת כל הנתונים

**Data Jar** → **Get Value**

- **Key Path**: `expenses`

---

#### פעולה 30: `Set Variable`

**Set Variable**

- **Variable Name**: `allExpenses`
- **Value**: תוצאת **Get Value** (פעולה 29)

---

#### פעולה 31: `Run Script` (Scriptable) — סנכרון לוידג'ט

חפש: **Scriptable** → **Run Script**

- **Script**: בחר **`ExpenseSync`**
- **Texts**: לחץ → בחר משתנה **`allExpenses`**

---

#### פעולה 32: `Show Notification` — הודעת הצלחה

חפש והוסף: **Show Notification**

- **Title**: לחץ על השדה והרכב:
  `💳 ₪` → [משתנה **`transactionAmount`**] → ` | ` → [משתנה **`merchantName`**]

- **Body**: הרכב:
  `📁 ` → [משתנה **`selectedCategory`**] → ` | כרטיס ****` → [משתנה **`cardNumber`**]

  שורה חדשה (Enter):
  `💰 סה"כ החודש: ₪` → [משתנה **`newTotal`**]

---

### 3.4 סיכום הזרימה

```
📲 גיהוץ Apple Pay
     │
     ▼
📲 גיהוץ Apple Pay (טריגר When I Tap)
     │
     ▼
1-2.  Format Date → Set Variable (todayDate)
3-4.  Format Date → Set Variable (currentTime)
5.    Set Variable (transactionAmount ← Shortcut Input > Amount)
6.    Set Variable (merchantName ← Shortcut Input > Merchant)
7.    Set Variable (cardNumber ← Shortcut Input > Card Number)
     │
     ▼
8-9.  Data Jar: Get merchantMap → Set Variable (knownMerchants)
10-11. Get Dictionary Value → Set Variable (autoCategory)
     │
     ▼
12.   If (autoCategory has any value?)
      │
   ┌──┴──┐
   כן    לא
   │      │
   13.   15-16. Data Jar: Get categories → Set Variable
   Set    17.    Choose from List (קטגוריות)
   Var    18.    Set Variable (selectedCategory)
   │      19.    Data Jar: Set merchantMap/[עסק] (לימוד!)
   │      │
   └──┬──┘
      │
20.   End If
      │
      ▼
21-22. Dictionary (עסקה) → Set Variable (newTransaction)
23.    Data Jar: Add to expenses/transactions
24-27. Get monthlyTotal → Calculate + amount → Set Variable (newTotal)
28.    Data Jar: Set monthlyTotal
29-30. Get expenses → Set Variable (allExpenses)
31.    Scriptable: Run ExpenseSync
32.    📲 Show Notification
```

**סה"כ: 32 פעולות | 0 לחיצות לעסק מוכר | 2-3 לחיצות לעסק חדש**

---

## 📊 שלב 4: Shortcut — הוצאות שלי (צפייה)

> Shortcut נפרד שמציג סיכום הוצאות — מופעל ידנית מאייקון/וידג'ט

### 4.1 יצירת Shortcut חדש

1. **Shortcuts** → לשונית **Shortcuts** → **+**
2. שנה שם ל: **הוצאות שלי**
3. אייקון: 💳

### 4.2 בניית הזרימה

---

#### פעולה 1: `Get Value` (Data Jar)

**Data Jar** → **Get Value**
- Key Path: `expenses/transactions`

#### פעולה 2: `Set Variable`

- Variable Name: `allTransactions`
- Value: תוצאת פעולה 1

---

#### פעולה 3: `Choose from Menu`

חפש: **Choose from Menu**

- **Prompt**: `💳 הוצאות שלי`
- הוסף 5 אפשרויות:
  1. `📊 סיכום חודשי`
  2. `📋 כל העסקאות`
  3. `📂 לפי קטגוריה`
  4. `💳 לפי כרטיס`
  5. `➕ הוסף ידנית`

---

### ↪️ ענף: 📊 סיכום חודשי

#### פעולות:

1. **Format Date** → Current Date → Custom: `yyyy-MM`
2. **Set Variable** → `currentYearMonth`
3. **Data Jar** → **Get Value** → Key: `expenses/monthlyTotal`
4. **Set Variable** → `monthTotal`
5. **Text**: כתוב:

```
📊 הוצאות חודש נוכחי
═══════════════════════════
💰 סה"כ: ₪
```
ואז הוסף משתנה `monthTotal`

6. **Set Variable** → `headerText`

7. **Repeat with Each** → Input: `allTransactions`

   **בתוך ה-Repeat:**
   - **Get Dictionary Value** → Dictionary: **Repeat Item** → Key: `date`
   - **Set Variable** → `txDate`
   - **If** → `txDate` → **begins with** → `currentYearMonth`
     - **Get Dictionary Value** → Repeat Item → Key: `merchant` → **Set Variable** → `txMerchant`
     - **Get Dictionary Value** → Repeat Item → Key: `amount` → **Set Variable** → `txAmount`
     - **Get Dictionary Value** → Repeat Item → Key: `category` → **Set Variable** → `txCategory`
     - **Get Dictionary Value** → Repeat Item → Key: `card` → **Set Variable** → `txCard`
     - **Text**: `[txDate] | [txMerchant] | ₪[txAmount] | [txCategory] | ****[txCard]`
       (לחץ ובחר משתנים בכל `[xxx]`)
   - **End If**

8. **End Repeat**

9. **Text**: הרכב:
```
[headerText]

[Repeat Results]
```

10. **Show Result** → Input: הטקסט מלמעלה

---

### ↪️ ענף: 📋 כל העסקאות

1. **Repeat with Each** → Input: `allTransactions`

   **בתוך ה-Repeat:**
   - חלץ כל שדה עם **Get Dictionary Value** + **Set Variable**
   - **Text**: `[date] | [merchant] | ₪[amount] | [category] | ****[card]`

2. **End Repeat**
3. **Show Result** → Input: **Repeat Results**

---

### ↪️ ענף: 📂 לפי קטגוריה

1. **Data Jar** → **Get Value** → Key: `categories`
2. **Set Variable** → `categoryList`
3. **Choose from List** → List: `categoryList` → Prompt: `📂 בחר קטגוריה`
4. **Set Variable** → `chosenCategory`

5. **Set Variable** → `catTotal` → Value: `0`
6. **Repeat with Each** → `allTransactions`
   - Get Dictionary Value → Key: `category` → Set Variable → `txCategory`
   - **If** `txCategory` **is** `chosenCategory`:
     - חלץ שדות + Text
     - Get `amount` → Calculate: `catTotal` + `txAmount` → Set Variable `catTotal`
   - End If
7. **End Repeat**
8. **Text**: header + Repeat Results + `💰 סה"כ: ₪[catTotal]`
9. **Show Result**

---

### ↪️ ענף: 💳 לפי כרטיס

1. **Repeat with Each** (pass 1) → `allTransactions`
   - Get Dictionary Value → Key: `card`
2. **End Repeat**
3. **Choose from List** → List: Repeat Results → Prompt: `💳 בחר כרטיס`
4. **Set Variable** → `chosenCard`

5. **Repeat with Each** (pass 2) → `allTransactions`
   - Get Dictionary Value → Key: `card` → Set Variable → `txCard`
   - **If** `txCard` **is** `chosenCard`: חלץ + Text
6. **End Repeat**
7. **Show Result**

---

### ↪️ ענף: ➕ הוסף ידנית

> להוספת עסקאות שלא עברו ב-Apple Pay (מזומן, העברה בנקאית, וכו')

1. **Ask for Input** → `💰 סכום` → Number
2. **Set Variable** → `manualAmount`

3. **Ask for Input** → `🏪 שם עסק` → Text
4. **Set Variable** → `manualMerchant`

5. **Data Jar** → **Get Value** → Key: `categories`
6. **Set Variable** → `categoryList`

7. **Choose from List** → List: `categoryList` → Prompt: `📁 קטגוריה`
8. **Set Variable** → `manualCategory`

9. **Ask for Input** → `💳 כרטיס (4 ספרות) או "מזומן"` → Text → Default: `מזומן`
10. **Set Variable** → `manualCard`

11. **Format Date** → Current Date → `yyyy-MM-dd` → **Set Variable** `manualDate`
12. **Format Date** → Current Date → `HH:mm` → **Set Variable** `manualTime`

13. **Dictionary** → 6 שדות (date, time, merchant, amount, category, card) עם המשתנים manual
14. **Set Variable** → `newTransaction`

15-22. (זהה לפעולות 23-32 מ-Shortcut "תעד עסקה"):
- Data Jar: Add to List → Get monthlyTotal → Calculate → Set monthlyTotal → Get expenses → Scriptable: Sync → Notification

---

### 4.3 הוספת Shortcut למסך הבית

1. פתח את Shortcut **"הוצאות שלי"**
2. לחץ על **⋯** (3 נקודות) או **▼** למעלה
3. **Add to Home Screen** (הוסף למסך הבית)
4. שם: `💳 הוצאות`
5. לחץ **Add**

---

## 🗑️ שלב 5: Shortcut — אפס חודש

> Shortcut לגיבוי CSV + איפוס נתוני החודש

### 5.1 יצירת Shortcut

1. **Shortcuts** → **+** → שם: **אפס חודש**
2. אייקון: 🗑️

### 5.2 בניית הזרימה

---

#### פעולה 1: `Choose from Menu`

- Prompt: `⚠️ ניהול נתונים`
- Options:
  1. `📁 גיבוי + איפוס חודש נוכחי`
  2. `⚠️ מחק הכל`
  3. `🔙 ביטול`

---

### ↪️ ענף: 📁 גיבוי + איפוס

1. **Show Alert** → Title: `⚠️ אישור` → Message: `האם לגבות ולאפס את נתוני החודש?` → Show Cancel: **ON**

2. **Scriptable** → **Run Script** → Script: **ExpenseExportCSV**
3. **Set Variable** → `exportResult`

4. **Get Dictionary Value** → Dictionary: `exportResult` → Key: `status`
5. **Set Variable** → `exportStatus`

6. **If** → `exportStatus` **is** `OK`:

   7. **Data Jar** → **Set Value** → Key: `expenses/monthlyTotal` → Value: `0`

   > **הערה:** העסקאות **לא נמחקות** — רק ה-monthlyTotal מתאפס, ההיסטוריה נשמרת.

   8. **Get Dictionary Value** → `exportResult` → Key: `count`
   9. **Set Variable** → `exportCount`
   10. **Get Dictionary Value** → `exportResult` → Key: `total`
   11. **Set Variable** → `exportTotal`

   12. **Data Jar** → **Get Value** → Key: `expenses`
   13. **Set Variable** → `allExpenses`
   14. **Scriptable** → **Run Script** → `ExpenseSync` → Text: `allExpenses` (עדכון Widget)

   15. **Show Notification** → Title: `📁 גיבוי נשמר` → Body: `[exportCount] עסקאות | ₪[exportTotal]`

16. **End If**

---

### ↪️ ענף: ⚠️ מחק הכל

1. **Show Alert** → Title: `⚠️ אזהרה` → Message: `פעולה זו תמחק את כל הנתונים. בלתי הפיכה!` → Show Cancel: **ON**

2. **Data Jar** → **Set Value** → Key: `expenses/transactions` → Empty List
3. **Data Jar** → **Set Value** → Key: `expenses/monthlyTotal` → `0`
4. **Data Jar** → **Set Value** → Key: `merchantMap` → Empty Dictionary

5. **Show Notification** → Title: `🗑️ כל הנתונים נמחקו`

---

### ↪️ ענף: 🔙 ביטול

*(ריק — ה-Shortcut מסתיים)*

---

### 5.3 אוטומציית איפוס חודשי (אופציונלי)

1. **Automation** → **+** → **Time of Day**
2. Time: **00:01**
3. Repeat: **Monthly** → **First Day**
4. Run Immediately: ON
5. Action: **Run Shortcut** → **אפס חודש**

---

## 📱 שלב 6: וידג'ט על מסך הבית

### 6.1 הוספת Widget של Scriptable

1. **לחיצה ארוכה** על מסך הבית
2. לחץ **Edit** → **Add Widget** (או **+** למעלה)
3. חפש **Scriptable**
4. בחר גודל:
   - **Small** — רק סה"כ + progress bar
   - **Medium** — סה"כ + קטגוריות + כרטיסים (**מומלץ**)
   - **Large** — הכל + עסקאות אחרונות
5. לחץ **Add Widget**

### 6.2 הגדרת Widget

1. **לחיצה ארוכה** על ה-Widget → **Edit Widget**
2. הגדרות:
   - **Script**: בחר **`ExpenseWidget`**
   - **When Interacting**: בחר **Open URL** והזן:
     ```
     shortcuts://run-shortcut?name=הוצאות%20שלי
     ```
3. לחץ מחוץ ל-Widget לשמירה

### 6.3 עדכון Widget

- מתעדכן אוטומטית כל **~15 דקות** (מגבלת iOS)
- לעדכון מיידי: **לחץ על ה-Widget**

---

## 🔧 פתרון בעיות

### When I Tap לא מופיע
- וודא iOS 26
- עדכן Shortcuts
- בדוק: הגדרות → Wallet & Apple Pay
- הטריגר נמצא בקטגוריה **Wallet** במסך האוטומציות

### Shortcut Input לא מציג Amount/Merchant
- לחץ על שדה Value ב-Set Variable
- בשורת המשתנים מעל המקלדת → לחץ **Shortcut Input**
- לחץ **שוב** על Shortcut Input לראות תת-שדות (Amount, Merchant, Card Number)
- אם לא מופיע — גלול **שמאלה** בשורת המשתנים

### Data Jar לא מגיב
- פתח Data Jar ובדוק שהמבנה נכון
- בדוק שהמפתחות (`expenses`, `merchantMap`, `categories`) קיימים
- נסה למחוק ולהגדיר מחדש

### Widget ריק / לא מתעדכן
- פתח Scriptable → הרץ `ExpenseWidget` ידנית → בדוק שגיאות
- וודא שקובץ `expenses.json` קיים ב: Files → Scriptable → ExpenseTracker
- הסר Widget והוסף מחדש

### Notification לא מופיע
- הגדרות → Notifications → Shortcuts → Allow Notifications: **ON**
- וודא ש-Focus Mode לא חוסם

### עסק לא "נלמד" אוטומטית
- בדוק ב-Data Jar → `merchantMap` → האם שם העסק שם
- Apple Pay מעביר שם עסק כפי שהוא מופיע בקורא הכרטיסים (עשוי להיות שונה מהשם שאתה מכיר)

---

## 📌 טיפים

1. **השתמש הרבה ב-Apple Pay** — ככל שמשתמשים יותר, ה-`merchantMap` לומד עסקים = פחות לחיצות
2. **הוסף עסקאות מזומן ידנית** — כדי שהסיכום יהיה מלא
3. **בדוק Widget כל כמה ימים** — לוודא סנכרון
4. **גבה כל חודש** — דרך "אפס חודש" או האוטומציה החודשית
5. **קובצי גיבוי** ב: Files → iCloud → Scriptable → ExpenseTracker → גיבויים

---

## 🏗️ מבנה קבצים

```
📱 iPhone
├─ 🔧 Shortcuts
│   ├─ ⚡ Automation: When I Tap → תעד עסקה (32 פעולות)
│   ├─ 📊 Shortcut: הוצאות שלי (צפייה + הוספה ידנית)
│   └─ 🗑️ Shortcut: אפס חודש (גיבוי + איפוס)
│
├─ 📦 Data Jar
│   ├─ expenses/transactions (List)
│   ├─ expenses/monthlyTotal (Number)
│   ├─ merchantMap (Dictionary — לומד עסקים אוטומטית)
│   └─ categories (List — 9 קטגוריות)
│
├─ 📜 Scriptable
│   ├─ ExpenseWidget.js (Widget)
│   ├─ ExpenseSync.js (סנכרון)
│   └─ ExpenseExportCSV.js (ייצוא)
│
└─ 📁 iCloud Files / Scriptable / ExpenseTracker
    ├─ expenses.json (נתונים לwidget)
    └─ גיבויים/
        └─ הוצאות-2026-02-פברואר.csv
```

---

**🎉 זהו! המערכת מוכנה לשימוש. גהץ לבריאות!**
