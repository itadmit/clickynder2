# תיקון Tooltips - pointer-events 🔧

## הבעיה 🐛
ה-tooltips לא הוצגו כאשר המשתמש מרחף מעל כפתורים עם אייקונים בלבד.

## הסיבה 🔍
אייקונים של Lucide-React מקבלים את ה-hover event במקום הכפתור עצמו, מה שמונע מה-tooltip המקורי (`title` attribute) להופיע.

## הפתרון ✅
הוספנו את המחלקה `pointer-events-none` לכל האייקונים בכפתורים, כך שה-hover event עובר דרכם אל הכפתור עצמו.

### קוד לפני:
```tsx
<button title="ניהול חופשים וימי היעדרות">
  <Calendar className="w-4 h-4" />
</button>
```

### קוד אחרי:
```tsx
<button title="ניהול חופשים וימי היעדרות">
  <Calendar className="w-4 h-4 pointer-events-none" />
</button>
```

## מה זה `pointer-events-none`? 💡
זוהי תכונת CSS שאומרת לאלמנט "להתעלם" מכל אירועי עכבר וטאץ'. כך האירועים עוברים דרך האייקון אל הכפתור שמאחוריו.

## קבצים שתוקנו 📂
1. `/src/components/staff/StaffList.tsx` - כפתורי חופשים, השבתה, מחיקה
2. `/src/components/services/ServicesList.tsx` - כפתורי השבתה, מחיקה
3. `/src/components/branches/BranchesList.tsx` - כפתורי השבתה, מחיקה
4. `/src/app/dashboard/customers/page.tsx` - כפתור צפייה

## בדיקה 🧪
1. פתח את הדשבורד: `http://localhost:3000/dashboard/staff`
2. רחף מעל כפתור 📅 (חופשים)
3. אמור להופיע tooltip: **"ניהול חופשים וימי היעדרות"**
4. רחף מעל כפתור 👁️ (השבתה)
5. אמור להופיע: **"השבתת העובד (לא יוצג ללקוחות)"**

## הערות חשובות ⚠️
- הכפתורים עם **טקסט** (`<span>עריכה</span>`) לא צריכים את התיקון הזה
- רק כפתורים עם **אייקון בלבד** צריכים `pointer-events-none`
- זה לא משפיע על לחיצה - רק על hover!

---

**תוקן:** אוקטובר 2024  
**נבדק:** ✅ עובד מצוין  
**תודה על הדיווח!** 🙏

