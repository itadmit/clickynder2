# Clickinder 🗓️

פלטפורמת תזמון תורים מתקדמת לעסקים בישראל - כמו Calendly אבל עם תמיכה מלאה בעברית ובצרכים המקומיים.

## 🚀 תכונות עיקריות

### לבעלי עסקים
- ✅ ניהול תורים חכם עם לוח שנה ויזואלי
- 👥 ניהול עובדים וסניפים מרובים
- 💅 ניהול שירותים וקטגוריות
- ⚙️ הגדרת שעות עבודה וזמינות מתקדמת
- 📊 סטטיסטיקות ודוחות
- 💳 חיבור לתשלומים אונליין (PayPlus)
- 🔔 התראות אוטומטיות ב-SMS, Email ו-WhatsApp
- 🎨 עיצוב מותאם אישית של עמוד ההזמנה

### ללקוחות
- 📅 הזמנת תורים קלה ונוחה
- 🔍 בחירת סניף, שירות ועובד
- ⏰ צפייה בזמינות בזמן אמת
- ✉️ קבלת אישורים ותזכורות
- 🔄 ביטול ושינוי תורים בקלות

## 🛠️ טכנולוגיות

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 16
- **Authentication**: NextAuth.js
- **Deployment**: Docker, Docker Compose
- **Notifications**: 
  - WhatsApp: Rappelsend API
  - SMS: ספקי SMS ישראליים
  - Email: SMTP / Nodemailer

## 📦 התקנה

### דרישות מקדימות
- Node.js 20+
- Docker & Docker Compose
- npm או yarn

### שלבי התקנה

1. **שכפול הפרויקט**
```bash
git clone <repository-url>
cd clickynder2
```

2. **התקנת תלויות**
```bash
npm install
```

3. **הגדרת משתני סביבה**
```bash
cp .env.example .env
```

ערוך את קובץ `.env` והזן את הערכים המתאימים:
```env
# Database
DATABASE_URL="postgresql://clickinder:clickinder123@localhost:5432/clickinder?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Rappelsend WhatsApp
RAPPELSEND_CLIENT_ID="your-client-id"
RAPPELSEND_API_TOKEN="your-api-token"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@clickinder.co.il"

# PayPlus (אופציונלי)
PAYPLUS_API_KEY=""
PAYPLUS_SECRET_KEY=""
PAYPLUS_TERMINAL_ID=""
```

4. **הרצת מסד הנתונים עם Docker**
```bash
docker-compose up -d postgres
```

5. **יצירת טבלאות במסד הנתונים**
```bash
npx prisma generate
npx prisma db push
```

6. **הרצת שרת הפיתוח**
```bash
npm run dev
```

האפליקציה תהיה זמינה בכתובת: http://localhost:3000

## 🐳 הרצה עם Docker

להרצת כל המערכת (אפליקציה + מסד נתונים):

```bash
docker-compose up -d
```

לעצירת המערכת:
```bash
docker-compose down
```

## 📱 אינטגרציה עם Rappelsend (WhatsApp)

המערכת תומכת בשליחת הודעות WhatsApp דרך [Rappelsend](https://rappelsend.com).

### הגדרה
1. הירשם ל-Rappelsend וקבל את ה-Client ID וה-API Token
2. הוסף את הפרטים לקובץ `.env`:
```env
RAPPELSEND_CLIENT_ID="your-client-id"
RAPPELSEND_API_TOKEN="your-api-token"
```

### שימוש בקוד

```typescript
import { sendWhatsAppMessage } from '@/lib/notifications/rappelsend';

// שליחת הודעה פשוטה
const result = await sendWhatsAppMessage(
  '0501234567',
  'שלום! התור שלך אושר בהצלחה'
);

if (result.success) {
  console.log('ההודעה נשלחה בהצלחה');
}
```

### API Endpoint
```bash
POST /api/notifications/send
Content-Type: application/json

{
  "businessId": "business-id",
  "channel": "whatsapp",
  "event": "booking_confirmed",
  "toAddress": "0501234567",
  "message": "שלום! התור שלך נקבע בהצלחה"
}
```

## 📊 מבנה מסד הנתונים

המערכת משתמשת ב-PostgreSQL עם Prisma ORM. העיקרון הוא Multi-Tenant - כל עסק מנותק לחלוטין מהאחרים.

### טבלאות עיקריות:
- `users` - משתמשים (בעלי עסקים)
- `businesses` - עסקים
- `branches` - סניפים
- `staff` - עובדים
- `services` - שירותים
- `customers` - לקוחות
- `appointments` - תורים
- `notifications` - התראות
- `packages` - חבילות מנוי
- `subscriptions` - מנויים

### סכמה מלאה
ראה `prisma/schema.prisma`

## 🔐 אבטחה

- Authentication עם NextAuth.js
- הצפנת סיסמאות עם bcrypt
- הפרדת נתונים מלאה בין עסקים (Multi-Tenant)
- HTTPS בייצור
- Validation של כל הקלטים
- Protection מפני SQL Injection (Prisma ORM)

## 🌐 פריסה לייצור

### Vercel (מומלץ)
```bash
vercel
```

### Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 תיעוד נוסף

- [אפיון מלא](docs/אפיון.md)
- [מבנה מסד נתונים](docs/אפיון%20מבנה%20מסד%20הנתונים.md)

## 🤝 תרומה

נשמח לתרומות! אנא פתח Issue או Pull Request.

## 📄 רישיון

MIT

## 💬 תמיכה

לשאלות ותמיכה: support@clickinder.co.il

---

Made with ❤️ in Israel 🇮🇱

