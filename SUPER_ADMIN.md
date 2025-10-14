# Super Admin Dashboard - מדריך

## סקירה כללית

מערכת Super Admin מאפשרת לך לנהל את כל המשתמשים, העסקים וההגדרות הגלובליות של Clickinder.

## גישה למערכת

### יצירת Super Admin ראשון

משתמש Super Admin ראשון צריך להיווצר ידנית במסד הנתונים:

```sql
-- התחבר ל-PostgreSQL
psql -d clickinder

-- עדכן משתמש קיים להיות Super Admin
UPDATE users 
SET is_super_admin = true 
WHERE email = 'your-email@example.com';
```

### כניסה למערכת

1. התחבר למערכת עם המשתמש שלך
2. גש ל: `http://localhost:3000/admin`
3. אם אינך Super Admin - תופנה אוטומטית ל-Dashboard

## תכונות

### 1. ניהול משתמשים

**ראה את כל המשתמשים במערכת:**
- שם, אימייל, טלפון
- עסקים שבבעלותם
- סטטוס מנוי (ניסיון/פעיל)
- הרשאות Super Admin

**פעולות זמינות:**
- 🔍 חיפוש משתמשים לפי שם או אימייל
- ⚡ הפעלה/השבתה של הרשאות Super Admin
- 🔄 העברת מנוי מ-"ניסיון" ל-"פעיל"
- 🗑️ מחיקת משתמש (כולל כל העסקים שלו)

### 2. ניהול מנויים

**שינוי סטטוס מנוי:**
- Trial → Active (העברה לשימוש מלא)
- Active → Cancelled (ביטול מנוי)
- מאריך תקופת המנוי ב-30 ימים בעת העברה לפעיל

### 3. הגדרות Rappelsend

**הגדרת פרטי WhatsApp Business:**
- Client ID - זיהוי לקוח מ-Rappelsend
- API Token - מפתח API לאימות

**איפה למצוא את הפרטים:**
1. התחבר ל-https://rappelsend.com
2. Account Settings → API Credentials
3. העתק את Client ID וה-API Token
4. הדבק בדף ההגדרות

**איך זה עובד:**
- הפרטים נשמרים במסד הנתונים (`system_settings`)
- המערכת משתמשת בהם לשליחת הודעות WhatsApp לכל הלקוחות
- אם אין פרטים ב-DB, המערכת משתמשת ב-`.env` (fallback)

### 4. סטטיסטיקות

**סיכום מהיר:**
- סך כל המשתמשים במערכת
- מספר עסקים פעילים
- מספר Super Admins

## API Endpoints

### משתמשים

```typescript
// עדכון משתמש (רק Super Admin)
PATCH /api/admin/users/[id]
Body: {
  isSuperAdmin?: boolean,
  name?: string,
  email?: string,
  phone?: string
}

// מחיקת משתמש (רק Super Admin)
DELETE /api/admin/users/[id]
```

### מנויים

```typescript
// עדכון סטטוס מנוי (רק Super Admin)
PATCH /api/admin/subscriptions/[businessId]
Body: {
  status: 'trial' | 'active' | 'cancelled'
}
```

### הגדרות מערכת

```typescript
// שמירת/עדכון הגדרה (רק Super Admin)
POST /api/admin/settings
Body: {
  key: string,
  value: string,
  description?: string,
  isEncrypted?: boolean
}

// קבלת כל ההגדרות (רק Super Admin)
GET /api/admin/settings
```

## אבטחה

### הגנות מובנות

1. **אימות חובה** - חייב להיות מחובר
2. **בדיקת הרשאות** - רק Super Admin יכול לגשת
3. **מניעת מחיקה עצמית** - לא ניתן למחוק את עצמך
4. **Cascade Delete** - מחיקת משתמש מוחקת גם את כל העסקים שלו

### מיגון נתונים רגישים

- API Token של Rappelsend יכול להיות מוצפן (שדה `isEncrypted`)
- סיסמאות לעולם לא מוצגות (רק hash)
- לוגים של כל פעולה

## דוגמאות שימוש

### העברת משתמש לפעיל

1. מצא את המשתמש בטבלה
2. בעמודת "סטטוס מנוי" לחץ על "העבר לפעיל"
3. המנוי יתעדכן ל-Active והתקופה תתחדש ל-30 ימים

### הענקת הרשאות Super Admin

1. מצא את המשתמש
2. בעמודת "הרשאות" לחץ על הכפתור
3. הסטטוס ישתנה ל-"Super Admin"
4. המשתמש יוכל לגשת ל-`/admin`

### הגדרת Rappelsend

1. עבור ללשונית "הגדרות מערכת"
2. בסעיף "הגדרות Rappelsend":
   - הכנס את Client ID
   - הכנס את API Token
3. הפרטים נשמרים אוטומטית כשמסיימים לערוך (onBlur)
4. בדוק שההודעות נשלחות תקין

## פתרון בעיות

### לא יכול לגשת ל-/admin

**סיבה:** המשתמש אינו Super Admin

**פתרון:**
```sql
UPDATE users 
SET is_super_admin = true 
WHERE email = 'your-email@example.com';
```

### הודעות WhatsApp לא נשלחות

**בדוק:**
1. פרטי Rappelsend תקינים (Client ID + API Token)
2. יש יתרה בחשבון Rappelsend
3. מספר הטלפון בפורמט נכון (972XXXXXXXXX)
4. לוג השרת לשגיאות

### שגיאה במחיקת משתמש

**סיבות אפשריות:**
- המשתמש הוא Super Admin (לא ניתן למחוק את עצמך)
- בעיית הרשאות במסד נתונים
- המשתמש כבר נמחק

## עדכונים עתידיים

- [ ] דוחות שימוש ו-analytics
- [ ] היסטוריית שינויים (audit log)
- [ ] הצפנה אוטומטית של API tokens
- [ ] ניהול תשלומים ופקטורות
- [ ] התראות אוטומטיות על בעיות
- [ ] ייצוא נתונים ל-CSV/Excel
- [ ] ניהול גרסאות של המערכת
- [ ] ניטור ביצועים בזמן אמת

## תמיכה

לשאלות או בעיות, צור קשר עם צוות הפיתוח.

---

**⚠️ אזהרה:** 
פאנל Super Admin נותן גישה מלאה לכל הנתונים והמערכות. השתמש באחריות!

