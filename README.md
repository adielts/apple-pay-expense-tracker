# 💳 מעקב הוצאות אשראי — iOS Shortcuts

> מערכת מעקב הוצאות אוטומטית לאייפון, מבוססת Apple Pay Transaction Trigger

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
| **iOS 17.2+** | מובנה | בדוק: הגדרות → כללי → אודות |
| **Shortcuts** | מובנה | כבר מותקן |
| **Data Jar** | חינם | [App Store](https://apps.apple.com/app/data-jar/id1453273600) |
| **Scriptable** | חינם | [App Store](https://apps.apple.com/app/scriptable/id1405459188) |
| **Apple Pay** | מובנה | לפחות כרטיס אחד מוגדר |

### ⚠️ חשוב לפני שמתחילים
- וודא שיש לך **Apple Pay מוגדר** עם לפחות כרטיס אחד
- וודא ש-**iCloud** מופעל (להגדרות → Apple ID → iCloud)
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
3. לחץ **+** → **Transaction** (עסקה)
4. **אל תסנן כרטיס ספציפי** — השאר "Any Card" (כל כרטיס)
5. בחר **Run Immediately** (הפעל מיד)
6. כבה את **Notify When Run** (נשלח notification משלנו)
7. לחץ **Next** (הבא)

### 3.2 בניית הזרימה — פעולה אחר פעולה

> **חשוב:** הוסף כל פעולה בסדר המדויק. חפש את שם הפעולה בשורת החיפוש.

---

#### פעולה 1: `Get Current Date`

פעולה: **Date** → `Current Date`

> זה ייתן לנו את התאריך הנוכחי

---

#### פעולה 2: `Format Date`

פעולה: **Format Date**
- Input: `Current Date` (מפעולה 1)
- Date Format: **Custom**
- Custom Format: `yyyy-MM-dd`
- שם המשתנה: `todayDate`

> **איך לשמור למשתנה:** לחץ על הפעולה → 3 נקודות (...) → Set Variable → שם: `todayDate`

---

#### פעולה 3: `Format Date` (שעה)

פעולה: **Format Date**
- Input: `Current Date`
- Date Format: **Custom**
- Custom Format: `HH:mm`
- שם המשתנה: `currentTime`

---

#### פעולה 4: `Set Variable` — סכום

פעולה: **Set Variable**
- Variable Name: `transactionAmount`
- Value: **Amount** (מהטריגר — מופיע כ-`Shortcut Input` > `Amount`)

> **חשוב:** כש-Transaction trigger מופעל, הוא מעביר אובייקט עם:
> - `Amount` — סכום העסקה
> - `Merchant` — שם העסק
> - `Currency` — מטבע
> - `Card Number` — 4 ספרות אחרונות

---

#### פעולה 5: `Set Variable` — שם עסק

פעולה: **Set Variable**
- Variable Name: `merchantName`
- Value: **Merchant** (מהטריגר)

---

#### פעולה 6: `Set Variable` — כרטיס

פעולה: **Set Variable**
- Variable Name: `cardNumber`
- Value: **Card Number** (מהטריגר — 4 ספרות אחרונות)

---

#### פעולה 7: `Get Value from Data Jar` — בדוק עסק מוכר

פעולה: **Data Jar** → **Get Value**
- Key Path: `merchantMap`
- שם משתנה: `knownMerchants`

---

#### פעולה 8: `Get Dictionary Value`

פעולה: **Get Dictionary Value**
- Dictionary: `knownMerchants` (מפעולה 7)
- Key: `merchantName` (משתנה מפעולה 5)
- שם משתנה: `autoCategory`

---

#### פעולה 9: `If` — עסק מוכר?

פעולה: **If**
- Input: `autoCategory`
- Condition: **has any value**

> אם העסק מוכר, `autoCategory` יכיל את הקטגוריה. אם לא — יהיה ריק.

---

#### פעולה 10 (בתוך If — כן): `Set Variable`

פעולה: **Set Variable**
- Variable Name: `selectedCategory`
- Value: `autoCategory`

> עסק מוכר → השתמש בקטגוריה האוטומטית

---

#### פעולה 11: `Otherwise` (המשך ה-If)

> עסק לא מוכר → בקש מהמשתמש לבחור קטגוריה

---

#### פעולה 12 (בתוך Otherwise): `Get Value from Data Jar`

פעולה: **Data Jar** → **Get Value**
- Key Path: `categories`
- שם משתנה: `categoryList`

---

#### פעולה 13 (בתוך Otherwise): `Choose from List`

פעולה: **Choose from List**
- List: `categoryList` (מפעולה 12)
- Prompt: `📁 בחר קטגוריה עבור: [merchantName]` (השתמש במשתנה)

---

#### פעולה 14 (בתוך Otherwise): `Set Variable`

פעולה: **Set Variable**
- Variable Name: `selectedCategory`
- Value: **Chosen Item** (מפעולה 13)

---

#### פעולה 15 (בתוך Otherwise): `Add to Data Jar` — לימוד עסק חדש

פעולה: **Data Jar** → **Set Value**
- Key Path: `merchantMap/[merchantName]`
  - **חשוב:** החלף `[merchantName]` במשתנה `merchantName` בפועל
- Value: `selectedCategory`

> **כך המערכת לומדת!** בפעם הבאה שתגהץ באותו עסק, הקטגוריה תיבחר אוטומטית.

---

#### פעולה 16: `End If`

(סגירת תנאי ה-If)

---

#### פעולה 17: `Dictionary` — יצירת אובייקט עסקה

פעולה: **Dictionary**
- הוסף את המפתחות הבאים:

| Key | Type | Value |
|-----|------|-------|
| `date` | Text | `todayDate` (משתנה) |
| `time` | Text | `currentTime` (משתנה) |
| `merchant` | Text | `merchantName` (משתנה) |
| `amount` | Number | `transactionAmount` (משתנה) |
| `category` | Text | `selectedCategory` (משתנה) |
| `card` | Text | `cardNumber` (משתנה) |

- שם משתנה: `newTransaction`

---

#### פעולה 18: `Add to Data Jar` — שמירת עסקה

פעולה: **Data Jar** → **Add Value to List**
- Value: `newTransaction` (מפעולה 17)
- Key Path: `expenses/transactions`

---

#### פעולה 19: `Get Value from Data Jar` — קריאת סה"כ נוכחי

פעולה: **Data Jar** → **Get Value**
- Key Path: `expenses/monthlyTotal`
- שם משתנה: `currentTotal`

---

#### פעולה 20: `Calculate` — עדכון סה"כ

פעולה: **Calculate**
- Operation: `currentTotal` + `transactionAmount`
- שם משתנה: `newTotal`

---

#### פעולה 21: `Set Value in Data Jar` — שמירת סה"כ חדש

פעולה: **Data Jar** → **Set Value**
- Key Path: `expenses/monthlyTotal`
- Value: `newTotal`

---

#### פעולה 22: `Get Value from Data Jar` — טעינת כל הנתונים

פעולה: **Data Jar** → **Get Value**
- Key Path: `expenses`
- שם משתנה: `allExpenses`

---

#### פעולה 23: `Run Script` — סנכרון ל-Scriptable

פעולה: **Scriptable** → **Run Script**
- Script: `ExpenseSync`
- Parameter (Text): `allExpenses`

> זה מעדכן את הקובץ שה-Widget קורא

---

#### פעולה 24: `Show Notification` — הודעת הצלחה

פעולה: **Show Notification**
- Title: `💳 ₪[transactionAmount] | [merchantName]`
- Body: `📁 [selectedCategory] | כרטיס ****[cardNumber] 💰 סה"כ: ₪[newTotal]`

> **השתמש במשתנים** — לחץ על כל `[xxx]` ובחר את המשתנה המתאים

---

### 3.3 סיכום הזרימה

```
📲 גיהוץ Apple Pay
     │
     ▼
[קליטת Amount, Merchant, Card מהטריגר]
     │
     ▼
[בדיקה: merchantMap מכיל את העסק?]
     │
  ┌──┴──┐
  כן    לא
  │      │
  │    [Choose from List — קטגוריה]
  │    [שמור עסק ב-merchantMap]
  │      │
  └──┬──┘
     │
 [selectedCategory]
     │
     ▼
[יצירת Dictionary עסקה]
     │
     ▼
[שמירה ב-Data Jar]
     │
     ▼
[עדכון monthlyTotal]
     │
     ▼
[סנכרון ל-Scriptable]
     │
     ▼
[📲 Notification הצלחה]
```

---

## 📊 שלב 4: Shortcut — הוצאות שלי (צפייה)

> Shortcut נפרד שמציג סיכום הוצאות — מופעל ידנית מאייקון/וידג'ט

### 4.1 יצירת Shortcut חדש

1. **Shortcuts** → לשונית **My Shortcuts** → **+** (חדש)
2. שם: **הוצאות שלי**
3. אייקון: 💳 (לחץ על האייקון → בחר emoji)

### 4.2 בניית הזרימה

---

#### פעולה 1: `Get Value from Data Jar`

פעולה: **Data Jar** → **Get Value**
- Key Path: `expenses/transactions`
- שם משתנה: `allTransactions`

---

#### פעולה 2: `Choose from Menu`

פעולה: **Choose from Menu**
- Prompt: `💳 הוצאות שלי`
- Options (הוסף 5 אפשרויות):
  1. `📊 סיכום חודשי`
  2. `📋 כל העסקאות`
  3. `📂 לפי קטגוריה`
  4. `💳 לפי כרטיס`
  5. `➕ הוסף ידנית`

---

### 4.2.1 אפשרות: 📊 סיכום חודשי

> בתוך הענף הראשון של Choose from Menu

#### פעולה: `Get Current Date` + `Format Date`
- Format: `yyyy-MM` → משתנה `currentYearMonth`

#### פעולה: `Repeat with Each`
- Input: `allTransactions`
- בתוך ה-loop:
  1. **Get Dictionary Value** → Key: `date` → משתנה `txDate`
  2. **If** `txDate` **begins with** `currentYearMonth`:
     - **Get Dictionary Value** → Key: `amount` → `txAmount`
     - **Get Dictionary Value** → Key: `category` → `txCategory`
     - **Get Dictionary Value** → Key: `card` → `txCard`
     - **Calculate**: `runningTotal` + `txAmount` → `runningTotal`
     - הוסף ל- Text variable `summaryText`:
       ```
       [txDate] | [txCategory] | [merchant] | ₪[txAmount] | ****[txCard]
       ```

#### פעולה: `Show Result`
```
📊 הוצאות [currentYearMonth]
═══════════════════════════
💰 סה"כ: ₪[runningTotal]
═══════════════════════════

[summaryText]
```

> **טיפ:** בגלל מגבלות של Shortcuts בחישוב group-by, אפשר לשמור את החישוב פשוט ולהציג רשימה כרונולוגית עם הקטגוריה ליד כל עסקה.

---

### 4.2.2 אפשרות: 📋 כל העסקאות

#### פעולה: `Repeat with Each`
- Input: `allTransactions`
- בתוך ה-loop:
  1. חלץ: `date`, `merchant`, `amount`, `category`, `card`
  2. הוסף שורה ל-Text:
     ```
     [date] | [merchant] | ₪[amount] | [category] | ****[card]
     ```

#### פעולה: `Show Result`
- תצוגת כל השורות

---

### 4.2.3 אפשרות: 📂 לפי קטגוריה

#### פעולה: `Get Value from Data Jar`
- Key: `categories` → `categoryList`

#### פעולה: `Choose from List`
- List: `categoryList`
- Prompt: `📂 בחר קטגוריה`
- משתנה: `chosenCategory`

#### פעולה: `Repeat with Each` + `If`
- סנן רק עסקאות שבהן `category` == `chosenCategory`
- הצג ב-Show Result

---

### 4.2.4 אפשרות: 💳 לפי כרטיס

#### פעולה: `Repeat with Each` (pass 1)
- אסוף ערכי `card` ייחודיים ← List

#### פעולה: `Choose from List`
- בחר כרטיס (4 ספרות)

#### פעולה: `Repeat with Each` (pass 2)
- סנן לפי כרטיס שנבחר
- הצג ב-Show Result

---

### 4.2.5 אפשרות: ➕ הוסף ידנית

> להוספת עסקאות שלא עברו ב-Apple Pay (מזומן, העברה בנקאית, וכו')

#### פעולה 1: `Ask for Input`
- Question: `💰 סכום`
- Input Type: **Number**
- משתנה: `manualAmount`

#### פעולה 2: `Ask for Input`
- Question: `🏪 שם עסק`
- Input Type: **Text**
- משתנה: `manualMerchant`

#### פעולה 3: `Get Value from Data Jar`
- Key: `categories`

#### פעולה 4: `Choose from List`
- Prompt: `📁 קטגוריה`
- משתנה: `manualCategory`

#### פעולה 5: `Ask for Input`
- Question: `💳 כרטיס (4 ספרות) — או "מזומן"`
- Input Type: **Text**
- Default: `מזומן`
- משתנה: `manualCard`

#### פעולות 6-12: (זהות לפעולות 2-3, 17-24 מ-Shortcut "תעד עסקה")
- Format date → Create dictionary → Save to Data Jar → Update total → Sync → Notification

---

### 4.3 הוספת Shortcut למסך הבית

1. פתח את Shortcut **"הוצאות שלי"**
2. לחץ על **⋯** (3 נקודות למעלה)
3. לחץ על **Share** (שתף) → **Add to Home Screen**
4. שם: `💳 הוצאות`
5. אייקון: בחר תמונה או glyph
6. לחץ **Add**

---

## 🗑️ שלב 5: Shortcut — אפס חודש

> Shortcut לגיבוי CSV + איפוס נתוני החודש

### 5.1 יצירת Shortcut

1. **Shortcuts** → **+** → שם: **אפס חודש**
2. אייקון: 🗑️

### 5.2 בניית הזרימה

---

#### פעולה 1: `Choose from Menu`

- Prompt: `⚠️ איפוס נתונים`
- Options:
  1. `📁 גיבוי + איפוס חודש נוכחי`
  2. `⚠️ מחק הכל`
  3. `🔙 ביטול`

---

### 5.2.1 ענף: גיבוי + איפוס

#### פעולה: `Show Alert`
- Title: `⚠️ אישור`
- Message: `האם לגבות ולאפס את נתוני החודש הנוכחי?`
- Buttons: **אישור** / **ביטול**
- Show Cancel Button: **ON**

#### פעולה: `Run Script` (Scriptable)
- Script: **ExpenseExportCSV**
- משתנה: `exportResult`

#### פעולה: `Get Dictionary Value`
- Dictionary: `exportResult`
- Key: `status`
- **If** value == `OK`:

  #### פעולה: `Set Value in Data Jar`
  - Key Path: `expenses/monthlyTotal`
  - Value: `0`

  > **הערה:** העסקאות **לא נמחקות** — הן נשארות להיסטוריה. רק ה-monthlyTotal מתאפס.
  > אם רוצים למחוק גם עסקאות: Set `expenses/transactions` ← Empty List

  #### פעולה: `Get Dictionary Value` (from exportResult)
  - Keys: `count`, `total`, `month`

  #### פעולה: `Show Notification`
  - Title: `📁 גיבוי נשמר`
  - Body: `[count] עסקאות | ₪[total] | [month]`
  - Body: `הקובץ נשמר ב-iCloud Files → Scriptable → ExpenseTracker → גיבויים`

---

### 5.2.2 ענף: מחק הכל

#### פעולה: `Show Alert`
- Title: `⚠️ אזהרה`
- Message: `פעולה זה תמחק את כל נתוני ההוצאות. פעולה בלתי הפיכה!`
- Show Cancel Button: **ON**

#### פעולה: `Set Value in Data Jar`
- Key Path: `expenses/transactions` → Empty List
- Key Path: `expenses/monthlyTotal` → `0`

#### פעולה: `Set Value in Data Jar`
- Key Path: `merchantMap` → Empty Dictionary

#### פעולה: `Show Notification`
- Title: `🗑️ כל הנתונים נמחקו`

---

### 5.2.3 ענף: ביטול

#### פעולה: **Nothing** (ריק — ה-Shortcut מסתיים)

---

### 5.3 אוטומציית איפוס חודשי (אופציונלי)

1. **Automation** → **+** → **Time of Day**
2. Time: **00:01**
3. Repeat: **Monthly** → **First Day**
4. Run Immediately: ON
5. Action: **Run Shortcut** → **אפס חודש**

> כך בכל 1 בחודש, הנתונים מגובים אוטומטית ו-monthlyTotal מתאפס

---

## 📱 שלב 6: וידג'ט על מסך הבית

### 6.1 הוספת Widget של Scriptable

1. **לחיצה ארוכה** על מסך הבית
2. לחץ **+** (פלוס) בפינה השמאלית העליונה
3. חפש **Scriptable**
4. בחר גודל Widget:
   - **Small** — רק סה"כ + progress bar
   - **Medium** — סה"כ + קטגוריות + כרטיסים (מומלץ)
   - **Large** — הכל + רשימת עסקאות אחרונות
5. לחץ **Add Widget**

### 6.2 הגדרת Widget

1. **לחיצה ארוכה** על ה-Widget → **Edit Widget**
2. הגדרות:
   - **Script**: בחר `ExpenseWidget`
   - **When Interacting**: **Run Script** (כך לחיצה תפתח את הסקריפט)
     - אם תרצה שלחיצה תפתח את Shortcut "הוצאות שלי", בחר **Open URL** והזן:
       `shortcuts://run-shortcut?name=הוצאות%20שלי`
3. לחץ מחוץ ל-Widget לשמירה

### 6.3 עדכון Widget

- ה-Widget מתעדכן אוטומטית כל **~15 דקות** (מגבלת iOS)
- אחרי עסקה חדשה, העדכון יופיע תוך 15 דקות לכל היותר
- לעדכון מיידי: **לחץ על ה-Widget** → הוא ירוץ מחדש

---

## 🔧 פתרון בעיות

### Transaction Trigger לא מופיע
- וודא iOS 17.2 ומעלה
- עדכן את Shortcuts לגרסה האחרונה
- נסה: הגדרות → Wallet & Apple Pay → Transaction Defaults

### Data Jar לא מגיב
- פתח את Data Jar ובדוק שהמבנה נכון
- בדוק שהמפתחות (`expenses`, `merchantMap`, `categories`) קיימים
- נסה למחוק ולהגדיר מחדש

### Widget ריק / לא מתעדכן
- פתח Scriptable → הרץ את `ExpenseWidget` ידנית → בדוק שגיאות
- וודא שקובץ `expenses.json` קיים ב: Files → Scriptable → ExpenseTracker
- הסר את ה-Widget והוסף מחדש

### Notification לא מופיע
- הגדרות → Notifications → Shortcuts → Allow Notifications: **ON**
- וודא ש-Focus Mode לא חוסם

### עסק לא "נלמד" אוטומטית
- בדוק ב-Data Jar → `merchantMap` → האם שם העסק שם
- ייתכן ששם העסק שונה מעט (רווחים, אותיות גדולות) — Apple Pay מעביר את השם כפי שהוא מופיע בקורא הכרטיסים

---

## 📌 טיפים

1. **השתמש הרבה ב-Apple Pay** — ככל שמשתמשים יותר, ה-`merchantMap` לומד יותר עסקים ופחות לחיצות נדרשות
2. **הוסף עסקאות מזומן ידנית** — כדי שהסיכום יהיה מלא
3. **בדוק את ה-Widget כל כמה ימים** — לוודא שהנתונים מסתנכרנים
4. **גבה כל חודש** — השתמש ב-"אפס חודש" או הפעל את האוטומציה החודשית
5. **קובצי הגיבוי** ב: Files → iCloud → Scriptable → ExpenseTracker → גיבויים

---

## 🏗️ מבנה קבצים

```
📱 iPhone
├─ 🔧 Shortcuts
│   ├─ ⚡ Automation: Transaction → תעד עסקה
│   ├─ 📊 Shortcut: הוצאות שלי
│   └─ 🗑️ Shortcut: אפס חודש
│
├─ 📦 Data Jar
│   ├─ expenses/transactions (List)
│   ├─ expenses/monthlyTotal (Number)
│   ├─ merchantMap (Dictionary)
│   └─ categories (List)
│
├─ 📜 Scriptable
│   ├─ ExpenseWidget.js (Widget)
│   ├─ ExpenseSync.js (סנכרון)
│   └─ ExpenseExportCSV.js (ייצוא)
│
└─ 📁 iCloud Files / Scriptable / ExpenseTracker
    ├─ expenses.json (נתונים)
    └─ גיבויים/
        └─ הוצאות-2026-02-פברואר.csv
```

---

**🎉 זהו! המערכת מוכנה לשימוש. גהץ לבריאות!**
