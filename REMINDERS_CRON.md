# מערכת תזכורות ואישורי הגעה

## סקירה כללית

המערכת מאפשרת לשלוח תזכורות אוטומטיות ובקשות אישור הגעה ללקוחות לפני התורים שלהם.

## מאפיינים

### 1. תזכורות אוטומטיות
- שליחת תזכורת ללקוח לפני התור
- ניתן להגדיר כמה שעות/ימים לפני (1 שעה עד 3 ימים)
- נשלחת ב-WhatsApp ו/או SMS ו/או Email

### 2. אישורי הגעה
- בקשה מהלקוח לאשר הגעה או לבטל
- כפתורים "מאשר הגעה" ו"צריך לבטל"
- העסק מקבל התראה על התגובה
- ביטול תור אוטומטי אם הלקוח בוחר "צריך לבטל"

## הגדרת Cron Job

### שיטה 1: Crontab בשרת Linux

1. הוסף משתנה סביבה `CRON_SECRET_KEY` ל-`.env`:
```bash
CRON_SECRET_KEY=your-super-secret-random-key-here-change-this
```

2. פתח את ה-crontab:
```bash
crontab -e
```

3. הוסף את השורה הבאה להפעלה כל 15 דקות:
```bash
*/15 * * * * curl -X POST https://clickynder.com/api/cron/send-reminders -H "Authorization: Bearer your-super-secret-random-key-here-change-this" >> /var/log/clickynder-reminders.log 2>&1
```

או כל שעה:
```bash
0 * * * * curl -X POST https://clickynder.com/api/cron/send-reminders -H "Authorization: Bearer your-super-secret-random-key-here-change-this" >> /var/log/clickynder-reminders.log 2>&1
```

### שיטה 2: EasyCron (שירות חיצוני)

1. היכנס ל-https://www.easycron.com/
2. צור משימה חדשה:
   - URL: `https://clickynder.com/api/cron/send-reminders`
   - Method: POST
   - Headers: `Authorization: Bearer your-super-secret-random-key-here-change-this`
   - Cron Expression: `*/15 * * * *` (כל 15 דקות)

### שיטה 3: GitHub Actions (אם יש לך GitHub repository)

צור קובץ `.github/workflows/cron-reminders.yml`:

```yaml
name: Send Reminders Cron

on:
  schedule:
    - cron: '*/15 * * * *'  # כל 15 דקות
  workflow_dispatch:  # אפשרות להפעלה ידנית

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Reminders
        run: |
          curl -X POST https://clickynder.com/api/cron/send-reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_KEY }}"
```

הוסף את `CRON_SECRET_KEY` ב-Settings > Secrets and variables > Actions

## בדיקת המערכת

### בדיקה ידנית
```bash
curl -X POST http://localhost:3000/api/cron/send-reminders \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json"
```

### צפייה בלוגים
```bash
# בשרת
sudo docker logs clickynder_app -f | grep "Reminder\|Confirmation"
```

## זרימת העבודה

### תזכורות
1. Cron רץ כל 15 דקות
2. בודק כל עסק עם `reminderEnabled: true`
3. מוצא תורים שצריכים תזכורת (לפי `reminderHoursBefore`)
4. שולח הודעת תזכורת ב-WhatsApp/SMS/Email
5. מתעד ב-`notifications` table

### אישורי הגעה
1. Cron רץ כל 15 דקות
2. בודק כל עסק עם `confirmationEnabled: true`
3. מוצא תורים שצריכים אישור (לפי `confirmationHoursBefore`)
4. יוצר `AppointmentConfirmation` עם token ייחודי
5. שולח הודעה עם לינקים לאישור/ביטול
6. הלקוח לוחץ על הלינק
7. API מעדכן את הסטטוס ושולח התראה לעסק

## API Endpoints

### POST `/api/cron/send-reminders`
- **תיאור**: מפעיל את תהליך שליחת התזכורות והאישורים
- **Headers**: `Authorization: Bearer {CRON_SECRET_KEY}`
- **Response**: 
```json
{
  "success": true,
  "results": {
    "reminders": 5,
    "confirmations": 3,
    "errors": 0
  }
}
```

### POST `/api/appointments/confirm-attendance/{token}`
- **תיאור**: מטפל באישור/ביטול של לקוח
- **Body**: `{ "action": "confirm" | "cancel" }`
- **Response**: הודעת הצלחה + פרטי התור

### GET `/confirm-attendance/{token}`
- **תיאור**: עמוד לאישור הגעה (UI ללקוח)
- **פרמטרים**: token בURL

## תבניות הודעות

### תזכורת רגילה (`booking_reminder`)
```
שלום {customer_name}! 👋

תזכורת לתור שלך:
📅 {appointment_date}
🕒 {appointment_time}
💈 {service_name}
👤 {staff_name}
📍 {branch_name}

נשמח לראותך! 😊
{business_name}
```

### אישור הגעה (`appointment_confirmation`)
```
היי {customer_name}! 👋

נשמח לאשר איתך שאתה מגיע לתור:
📅 {appointment_date}
🕒 {appointment_time}
💈 {service_name}
👤 {staff_name}
📍 {branch_name}

✅ מאשר הגעה? לחץ כאן:
{confirm_link}

❌ צריך לבטל? לחץ כאן:
{cancel_link}

תודה!
{business_name}
```

## טיפול בשגיאות

- אם שליחת הודעה נכשלת, זה לא עוצר את המשך התהליך
- כל שגיאה נרשמת ב-console log
- ה-cron ממשיך לתורים הבאים

## אופטימיזציה

- ה-cron עובד רק על תורים `confirmed`
- לא שולח תזכורת/אישור יותר מפעם אחת ב-24 שעות
- טוקנים לאישורים פגים אוטומטית שעה לפני התור
- שאילתות עם אינדקסים לביצועים מהירים

## מעקב ודיווח

### Dashboard Notifications
העסק מקבל התראות על:
- ✅ לקוח אישר הגעה
- ❌ לקוח ביטל תור
- ⏰ תזכורת נשלחה

### Notifications Table
כל הודעה נרשמת ב-`notifications` table עם:
- סטטוס שליחה
- ערוץ (WhatsApp/SMS/Email)
- זמן שליחה
- תוכן ההודעה

