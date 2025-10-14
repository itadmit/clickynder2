# 🔐 הגדרת התחברות Google OAuth

מדריך מפורט להגדרת התחברות דרך Google ב-Clickinder

---

## 📋 שלבים להגדרה

### שלב 1: הגדרת Google Cloud Console

אתה כבר יצרת פרויקט ב-Google Cloud Console - מצוין! עכשיו נמשיך:

#### 1.1 הפעלת Google+ API
1. היכנס ל-[Google Cloud Console](https://console.cloud.google.com/)
2. בחר את הפרויקט שלך: **Clickynder**
3. לך ל: **APIs & Services** → **Library**
4. חפש: **Google+ API** או **Google Identity**
5. לחץ על **Enable**

#### 1.2 יצירת OAuth 2.0 Credentials
1. לך ל: **APIs & Services** → **Credentials**
2. לחץ על **+ CREATE CREDENTIALS** → **OAuth client ID**
3. אם תתבקש, תצור **OAuth consent screen** קודם:
   - בחר: **External** (למבחנים) או **Internal** (אם יש לך Google Workspace)
   - מלא:
     - **App name**: Clickinder
     - **User support email**: המייל שלך
     - **Developer contact information**: המייל שלך
   - **Scopes**: הוסף:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - שמור והמשך

4. חזור ל-**Credentials** → **Create OAuth client ID**
5. בחר **Application type**: **Web application**
6. תן שם: **Clickinder Web Client**
7. הוסף **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```

8. הוסף **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

9. לחץ על **Create**
10. **שמור את הפרטים**:
    - **Client ID** - נראה כמו: `123456789-abc.apps.googleusercontent.com`
    - **Client Secret** - נראה כמו: `GOCSPX-xxxxxxxxxxxxx`

---

### שלב 2: הגדרת משתני סביבה

צור קובץ `.env` בשורש הפרויקט (אם לא קיים):

```bash
# בטרמינל
cd /Users/tadmitinteractive/Desktop/clickynder2
touch .env
```

פתח את הקובץ `.env` והוסף:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clickinder"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth - הדבק כאן את הפרטים מ-Google Console
GOOGLE_CLIENT_ID="123456789-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxx"
```

#### יצירת NEXTAUTH_SECRET:
בטרמינל, הרץ:
```bash
openssl rand -base64 32
```
העתק את התוצאה והדבק כ-`NEXTAUTH_SECRET`

---

### שלב 3: עדכון מסד הנתונים

NextAuth דורש טבלאות נוספות במסד הנתונים. בדוק אם `schema.prisma` שלך כולל:

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

אם חסר, הרץ:
```bash
npm run db:generate
npm run db:push
```

---

### שלב 4: הפעלת השרת

```bash
npm run dev
```

---

## ✅ בדיקה

1. פתח: http://localhost:3000/auth/signin
2. לחץ על כפתור **Google**
3. אמור להיפתח חלון Google OAuth
4. בחר חשבון Google
5. אשר הרשאות
6. המערכת תבדוק אם המשתמש קיים:
   - **אם קיים** → מועבר ל-dashboard
   - **אם לא קיים** → מועבר להרשמה

---

## 🔧 פתרון בעיות נפוצות

### שגיאה: "Redirect URI mismatch"
- ודא ש-URL מדויק ב-Google Console
- כולל את ה-protocol (`http://` או `https://`)
- ללא slash בסוף

### שגיאה: "Access blocked: This app's request is invalid"
- ודא ש-OAuth consent screen מוגדר
- הוסף את המייל שלך כ-Test user אם האפליקציה ב-Testing mode

### שגיאה: "NEXTAUTH_URL is missing"
- ודא שיש לך `.env` עם `NEXTAUTH_URL=http://localhost:3000`

### המשתמש לא נשמר בDB
- בדוק שיש טבלת `Account` במסד הנתונים
- הרץ: `npm run db:push`

---

## 📝 הערות חשובות

### אבטחה
- **אל תשתף את ה-Client Secret**
- הוסף `.env` ל-`.gitignore`
- ב-production, השתמש ב-Environment Variables של הפלטפורמה

### Testing Mode
- Google מגביל את האפליקציה ל-100 משתמשים בזמן Testing
- לאחר פיתוח, שלח ל-Verification כדי להפוך ל-Production

### רישום משתמשים חדשים דרך Google
כרגע, המערכת מאפשרת רק התחברות למשתמשים קיימים.
אם תרצה לאפשר רישום אוטומטי דרך Google, צריך לעדכן את ה-`signIn` callback ב-`auth.ts`.

---

## 🚀 שלבים הבאים

1. ✅ הגדרת Google OAuth
2. 🔄 הוספת Facebook Login (אופציונלי)
3. 📧 אימות מייל (Email verification)
4. 🔐 2FA - אימות דו-שלבי

---

## 📞 עזרה נוספת

אם יש בעיות:
1. בדוק את ה-Console בדפדפן (F12)
2. בדוק את לוגים של Next.js בטרמינל
3. ודא שכל משתני הסביבה מוגדרים נכון

---

**בהצלחה! 🎉**

