# טור הסבר (Onboarding Tour) 🎓

תיעוד מערכת טור ההסבר למשתמשים חדשים ב-Clickynder.

## תאריך עדכון: 18 אוקטובר 2025

---

## 📋 סיכום

טור הסבר (Onboarding Tour) הוא מערכת הדרכה אינטראקטיבית שמופיעה למשתמש **בהתחברות הראשונה** לדשבורד.

המטרה: להסביר למשתמש החדש מה כבר הוכן עבורו ואיך להתחיל להשתמש במערכת.

---

## 🎯 תכונות עיקריות

### ✅ הופעה אוטומטית
- מופיע **אוטומטית** בכניסה הראשונה לדשבורד
- נשמר ב-localStorage שהמשתמש כבר ראה את הטור
- לא מופיע שוב אחרי שהמשתמש סיים/דילג

### ✅ 5 שלבים מפורטים

#### **שלב 1: ברוכים הבאים** 🎉
- הצגת המערכת
- הסבר שהכנו עבורו את הבסיס
- אייקון: Sparkles ✨
- צבעים: סגול לורוד (purple-pink gradient)

#### **שלב 2: העובד הראשון** 👤
- הסבר שנוצר עובד בשמו
- אפשרות לערוך פרטים, להוסיף תמונה, להגדיר שעות
- לינק: `/dashboard/staff`
- אייקון: Users 👥
- צבעים: כחול ציאן (blue-cyan gradient)

#### **שלב 3: שירות כללי** ✂️
- הסבר על השירות הבסיסי שנוצר
- פרטים: "שירות כללי", ₪100, 60 דקות
- אפשרות לעריכה והוספת שירותים
- לינק: `/dashboard/services`
- אייקון: Scissors ✂️
- צבעים: ירוק (green-emerald gradient)

#### **שלב 4: עמוד התורים** 📅
- הסבר שכל התורים יופיעו שם
- אפשרות ליצירת תורים ידנית
- לקוחות יכולים לקבוע דרך הלינק הציבורי
- לינק: `/dashboard/appointments`
- אייקון: Calendar 📅
- צבעים: כתום אדום (orange-red gradient)

#### **שלב 5: מוכן להתחיל** 🚀
- הצגת הלינק הציבורי
- עידוד לשתף עם לקוחות
- כפתור "בואו נתחיל!"
- אייקון: Check ✓
- צבעים: אינדיגו סגול (indigo-purple gradient)

---

## 🎨 עיצוב וחוויית משתמש (UX)

### עיצוב ויזואלי
- **Modal מרכזי** על רקע כהה מטושטש (backdrop-blur)
- **Gradient headers** - כל שלב עם צבעים ייחודיים
- **אייקונים גדולים** - להדגשת הנושא
- **Progress bar** - מראה התקדמות בין השלבים
- **Step indicators** - נקודות בתחתית (ירוקות לשלבים שעברו)

### אינטראקטיביות
- ✅ ניווט קדימה/אחורה
- ✅ קפיצה ישירה לשלב (לחיצה על נקודות)
- ✅ כפתורי לינק לעמודים רלוונטיים
- ✅ אפשרות לדלג על ההדרכה
- ✅ כפתור סגירה (X) בפינה

### אנימציות
- **Fade in** - כשהטור נפתח
- **Transition duration 500ms** - למעבר ב-progress bar
- **Hover effects** - על כפתורים ולינקים
- **Shadow effects** - שכבות צל שמשתנות ב-hover

---

## 🔧 מבנה טכני

### קבצים שנוצרו

#### 1. `OnboardingTour.tsx`
הקומפוננטה הראשית של הטור.

**Props:**
```typescript
interface OnboardingTourProps {
  businessSlug: string;    // הלינק הציבורי של העסק
  staffCount: number;       // כמות עובדים (למידע)
  servicesCount: number;    // כמות שירותים (למידע)
}
```

**State:**
```typescript
const [isOpen, setIsOpen] = useState(false);      // האם הטור פתוח
const [currentStep, setCurrentStep] = useState(0); // השלב הנוכחי (0-4)
```

**localStorage:**
```typescript
localStorage.getItem('hasSeenOnboardingTour')  // בדיקה אם ראה
localStorage.setItem('hasSeenOnboardingTour', 'true')  // סימון שראה
```

#### 2. `DashboardClient.tsx`
Wrapper קומפוננטה client-side (כי צריך localStorage).

```typescript
export function DashboardClient({ 
  businessSlug, 
  staffCount, 
  servicesCount 
}: DashboardClientProps) {
  return (
    <OnboardingTour 
      businessSlug={businessSlug}
      staffCount={staffCount}
      servicesCount={servicesCount}
    />
  );
}
```

#### 3. עדכון ב-`dashboard/page.tsx`
הוספת הקומפוננטה בתחילת הדשבורד:

```typescript
return (
  <>
    <DashboardClient
      businessSlug={business.slug}
      staffCount={business._count.staff}
      servicesCount={business._count.services}
    />
    
    <DashboardHeader ... />
    ...
  </>
);
```

---

## 🎬 תרחישי שימוש

### תרחיש 1: משתמש חדש נרשם
1. משתמש משלים רישום
2. מועבר לדשבורד
3. הטור נפתח אוטומטית ✅
4. עובר דרך 5 השלבים
5. לוחץ "בואו נתחיל!"
6. הטור נסגר ונשמר ב-localStorage

### תרחיש 2: משתמש דילג על הטור
1. משתמש נרשם ומועבר לדשבורד
2. הטור נפתח
3. לוחץ "דלג על ההדרכה"
4. הטור נסגר ונשמר ב-localStorage
5. לא יופיע שוב

### תרחיש 3: משתמש חוזר
1. משתמש מתחבר שוב
2. המערכת בודקת localStorage
3. מוצא `hasSeenOnboardingTour: true`
4. הטור **לא** מופיע ✅

### תרחיש 4: ניקוי localStorage (למבחן)
```javascript
// בקונסול:
localStorage.removeItem('hasSeenOnboardingTour');
// רענן את הדף - הטור יופיע שוב
```

---

## 📱 רספונסיביות

### מובייל (< 768px)
- ✅ Modal תופס 100% רוחב (עם padding)
- ✅ טקסט קטן יותר (text-lg → text-base)
- ✅ כפתורים מלאים ברוחב
- ✅ Padding קטן יותר (p-6 במקום p-8)
- ✅ אייקונים 6x6 במקום 8x8

### טאבלט (768px - 1024px)
- ✅ Modal ברוחב max-w-2xl
- ✅ כפתורים זה לצד זה
- ✅ Padding בינוני (p-6)

### דסקטופ (> 1024px)
- ✅ Modal ברוחב מקסימלי max-w-2xl
- ✅ כל האלמנטים בגודל מלא
- ✅ Padding גדול (p-8)
- ✅ Shadow effects מודגשים

---

## 🎨 צבעים ו-Gradients

```css
/* שלב 1 - ברוכים הבאים */
from-purple-500 to-pink-500

/* שלב 2 - עובדים */
from-blue-500 to-cyan-500

/* שלב 3 - שירותים */
from-green-500 to-emerald-500

/* שלב 4 - תורים */
from-orange-500 to-red-500

/* שלב 5 - מוכן */
from-indigo-500 to-purple-500
```

---

## 🔄 זרימת הנתונים

```
┌─────────────────────────────┐
│  dashboard/page.tsx         │
│  (Server Component)         │
│                             │
│  - שולף נתוני עסק מהDB      │
│  - מחשב staff & services    │
└──────────┬──────────────────┘
           │
           │ Props: businessSlug,
           │        staffCount,
           │        servicesCount
           ▼
┌─────────────────────────────┐
│  DashboardClient.tsx        │
│  (Client Component)         │
│                             │
│  - מעביר props הלאה         │
└──────────┬──────────────────┘
           │
           │ Same Props
           ▼
┌─────────────────────────────┐
│  OnboardingTour.tsx         │
│  (Client Component)         │
│                             │
│  - בודק localStorage        │
│  - מציג/מסתיר טור           │
│  - מנהל navigation          │
└─────────────────────────────┘
```

---

## 🧪 בדיקות

### בדיקות ידניות מומלצות:

#### 1. **הופעה ראשונה**
```bash
# ברירת מחדל - צריך להופיע
1. נקה localStorage
2. התחבר/הירשם
3. וודא שהטור מופיע ✅
```

#### 2. **ניווט בין שלבים**
```bash
1. לחץ "הבא" - וודא מעבר לשלב 2 ✅
2. לחץ "קודם" - וודא חזרה לשלב 1 ✅
3. לחץ על נקודה 4 - וודא קפיצה לשלב 4 ✅
```

#### 3. **לינקים**
```bash
1. בשלב 2 לחץ "לצפייה בעובדים" ✅
2. וודא מעבר ל-/dashboard/staff
3. חזור - הטור לא יופיע (localStorage)
```

#### 4. **דילוג**
```bash
1. פתח טור חדש
2. לחץ "דלג על ההדרכה" ✅
3. רענן דף - הטור לא יופיע ✅
```

#### 5. **סגירה**
```bash
1. פתח טור
2. לחץ X בפינה ✅
3. רענן דף - הטור לא יופיע ✅
```

#### 6. **שלב אחרון**
```bash
1. הגע לשלב 5
2. וודא כפתור ירוק "בואו נתחיל!" ✅
3. לחץ - הטור נסגר ✅
4. localStorage מתעדכן ✅
```

---

## 🎯 מקרי קצה (Edge Cases)

### 1. **משתמש בלי staff/services**
- הטור עדיין מופיע
- המשפטים מותאמים (בלי "כבר מחכה לך")
- staffCount=0, servicesCount=0 לא גורמים לבעיה

### 2. **משתמש עם דפדפנים מרובים**
- localStorage נשמר **לכל דפדפן בנפרד**
- אם פותח בדפדפן אחר - הטור יופיע שוב
- זה OK - זה בכוונה (per-browser)

### 3. **מצב פרטי (Incognito)**
- localStorage נמחק בסגירת המצב הפרטי
- הטור יופיע בכל פעם חדש
- זה OK - התנהגות נורמלית

### 4. **משתמש ממכשיר אחר**
- localStorage לא משותף בין מכשירים
- הטור יופיע במכשיר החדש
- זה OK - כל מכשיר הוא "פעם ראשונה"

---

## 🚀 שיפורים עתידיים (Future Enhancements)

### רעיונות לגרסאות הבאות:

1. **📊 Tracking**
   - שמירה בDB מתי המשתמש ראה את הטור
   - סטטיסטיקות: כמה אחוז משלימים את הטור

2. **🎥 וידאו**
   - הוספת סרטוני הסבר קצרים
   - GIF animations להמחשה

3. **✨ Interactive Elements**
   - highlight אלמנטים בדשבורד (tooltips)
   - "לחץ כאן" עם חצים מנוקדים

4. **🔁 אפשרות לראות שוב**
   - כפתור "הדרכה" בתפריט
   - מאפשר למשתמש לראות את הטור שוב

5. **🌐 תרגום**
   - תמיכה בשפות נוספות
   - אנגלית, ערבית, רוסית

6. **🎮 Gamification**
   - נקודות על השלמת שלבים
   - באדג'ים למשתמשים שעברו הדרכה

---

## 📝 הערות למפתחים

### Client vs Server Components
הטור הוא **Client Component** כי:
- משתמש ב-localStorage (זמין רק בדפדפן)
- משתמש ב-useState
- מנהל אינטראקציות משתמש

ה-Dashboard Page נשאר **Server Component** כדי:
- לשלוף נתונים מהDB
- לשמור על ביצועים טובים

### Performance
- הקומפוננטה קלה (<5KB)
- לא משפיעה על זמן טעינה
- מופיעה רק פעם אחת

### Accessibility (נגישות)
- ✅ כפתורים עם `aria-label`
- ✅ ניווט במקלדת (Tab, Enter)
- ✅ צבעים בניגודיות גבוהה
- ✅ טקסט קריא בגדלים שונים

---

## 🔗 קישורים רלוונטיים

- `src/components/dashboard/OnboardingTour.tsx` - הקומפוננטה הראשית
- `src/components/dashboard/DashboardClient.tsx` - ה-wrapper
- `src/app/dashboard/page.tsx` - דף הדשבורד
- `src/app/globals.css` - אנימציות ועיצוב גלובלי

---

**עודכן לאחרונה:** 18 אוקטובר 2025, 10:35
**גרסה:** v1.0.0
**מפתח:** Clickynder Team

