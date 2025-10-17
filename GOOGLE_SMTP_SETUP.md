# 📧 הגדרת Google SMTP ב-Clickynder

## מבוא
Clickynder תומך בשליחת מיילים דרך Google SMTP (Gmail). 
ההגדרות מנוהלות דרך ממשק האדמין ונשמרות בדאטהבייס באופן מאובטח.

## 🔧 הגדרה ראשונית

### שלב 1: יצירת App Password ב-Gmail

1. **היכנס לחשבון Google שלך:**
   - גש ל-[Google Account Security](https://myaccount.google.com/security)

2. **הפעל אימות דו-שלבי:**
   - בחר "2-Step Verification"
   - עקוב אחר ההוראות להפעלת האימות

3. **צור App Password:**
   - חזור ל-Security page
   - גלול ל-"Signing in to Google"
   - לחץ על "App passwords"
   - בחר "Mail" כ-App type
   - בחר "Other" כ-Device ותן לו שם (למשל "Clickynder")
   - **העתק את הסיסמה בת 16 התווים שמופיעה**

### שלב 2: הגדרת SMTP בממשק האדמין

1. **היכנס לדף האדמין:**
   - גש ל-`/admin` (זמין רק ל-Super Admin)

2. **עבור לטאב "הגדרות מערכת"**

3. **מלא את הפרטים בסקשן "הגדרות Google SMTP":**
   - **SMTP Host:** `smtp.gmail.com` (ברירת מחדל)
   - **SMTP Port:** 
     - `587` - TLS/STARTTLS (מומלץ)
     - `465` - SSL
   - **Gmail Address:** כתובת המייל שלך (למשל: `mycompany@gmail.com`)
   - **App Password:** הדבק את הסיסמה בת 16 התווים
   - **שם השולח:** השם שיופיע למקבל (למשל: "Clickynder")

4. **לחץ על "שמור הגדרות"**

5. **בדוק את החיבור:**
   - לחץ על "בדוק חיבור"
   - אם הכל מוגדר נכון, תקבל הודעת הצלחה ✅

## 🔒 אבטחה

- **הצפנת סיסמאות:** 
  - הסיסמה נשמרת בדאטהבייס באופן מוצפן (AES-256-CBC)
  - משתמש במפתח הצפנה מ-`ENCRYPTION_KEY` ב-ENV

- **הרשאות:**
  - רק Super Admin יכול לראות ולערוך הגדרות SMTP
  - ה-API endpoints מאובטחים עם session validation

## 📝 הגדרות מתקדמות

### שימוש ב-ENV כ-Fallback

אם אין הגדרות בדאטהבייס, המערכת תשתמש ב-ENV variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM_NAME=Clickynder
EMAIL_FROM=your-email@gmail.com
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Cache

- הגדרות SMTP נשמרות ב-cache למשך 5 דקות
- שינויים ייכנסו לתוקף תוך מקסימום 5 דקות

## 🧪 בדיקה

### בדיקת חיבור מהממשק
לחץ על כפתור "בדוק חיבור" בממשק האדמין.

### בדיקת שליחת מייל (API)
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

## ❗ פתרון בעיות

### שגיאה: "Invalid login"
- וודא שהפעלת אימות דו-שלבי
- וודא שיצרת App Password ולא משתמש בסיסמה הרגילה
- בדוק שהעתקת את כל 16 התווים

### שגיאה: "Connection timeout"
- בדוק את ה-Port (587 או 465)
- וודא שה-Firewall לא חוסם את החיבור

### שגיאה: "SMTP not configured"
- וודא ששמרת את ההגדרות בממשק
- בדוק שיש גישה לדאטהבייס

## 📡 API Endpoints

### GET `/api/admin/smtp-settings`
קבלת הגדרות SMTP נוכחיות (ללא סיסמה)

**Response:**
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": "587",
  "smtp_secure": "false",
  "smtp_user": "mycompany@gmail.com",
  "smtp_from_name": "Clickynder",
  "smtp_from_email": "mycompany@gmail.com",
  "hasPassword": true
}
```

### POST `/api/admin/smtp-settings`
שמירת הגדרות SMTP

**Body:**
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": "587",
  "smtp_secure": false,
  "smtp_user": "mycompany@gmail.com",
  "smtp_password": "abcd efgh ijkl mnop",
  "smtp_from_name": "Clickynder",
  "smtp_from_email": "mycompany@gmail.com"
}
```

### PUT `/api/admin/smtp-settings`
בדיקת חיבור SMTP

**Response:**
```json
{
  "success": true
}
```

## 🔄 Migration

ההגדרות נשמרות ב-`system_settings` table:

| Key | Value | Description |
|-----|-------|-------------|
| `smtp_host` | `smtp.gmail.com` | SMTP Server |
| `smtp_port` | `587` | SMTP Port |
| `smtp_secure` | `false` | Use SSL/TLS |
| `smtp_user` | `email@gmail.com` | Username |
| `smtp_password` | `encrypted...` | Password (encrypted) |
| `smtp_from_name` | `Clickynder` | From Name |
| `smtp_from_email` | `email@gmail.com` | From Email |

## 📚 קבצים רלוונטיים

- `/src/lib/notifications/email-service.ts` - שירות שליחת מיילים
- `/src/app/api/admin/smtp-settings/route.ts` - API endpoints
- `/src/components/admin/SMTPSettingsSection.tsx` - ממשק ניהול
- `/prisma/schema.prisma` - הגדרות DB

## ✅ סיכום

✅ שליחת מיילים דרך Gmail  
✅ ניהול הגדרות דרך ממשק Admin  
✅ הצפנת סיסמאות  
✅ בדיקת חיבור מובנית  
✅ Cache לביצועים טובים  
✅ Fallback ל-ENV  

---

**נוצר:** 2025-10-16  
**גרסה:** 1.0

