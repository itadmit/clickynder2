# בדיקות נרמול מספרי טלפון

## פונקציה: `normalizePhoneNumber()`

### מקרי בדיקה - פורמטים ישראליים

| קלט | פלט צפוי | תיאור |
|-----|----------|-------|
| `0542284283` | `972542284283` | מספר ישראלי רגיל עם 0 |
| `054-228-4283` | `972542284283` | עם מקפים |
| `054-228-4283` | `972542284283` | עם מקפים ורווחים |
| `(054) 228-4283` | `972542284283` | עם סוגריים |
| `054.228.4283` | `972542284283` | עם נקודות |

### מקרי בדיקה - פורמטים בינלאומיים

| קלט | פלט צפוי | תיאור |
|-----|----------|-------|
| `972542284283` | `972542284283` | כבר בפורמט נכון |
| `+972542284283` | `972542284283` | עם + |
| `+972-54-228-4283` | `972542284283` | עם + ומקפים |
| `00972542284283` | `972542284283` | פורמט 00 |
| `972-54-228-4283` | `972542284283` | עם מקפים |

### מקרי קצה

| קלט | פלט צפוי | תיאור |
|-----|----------|-------|
| `542284283` | `972542284283` | 9 ספרות בלי 0 |
| `0542284283123` | `972542284283` | יותר מדי ספרות - חותך |
| `050-1234567` | `972501234567` | מספר אחר |
| `03-1234567` | `97231234567` | מספר קווי |

## בדיקה ידנית

### באמצעות Node.js REPL

```javascript
// בטרמינל הפרויקט:
// cd /Users/tadmitinteractive/Desktop/clickynder2
// node

const { normalizePhoneNumber } = require('./src/lib/notifications/rappelsend');

// בדיקות:
console.log(normalizePhoneNumber('0542284283')); // צפוי: 972542284283
console.log(normalizePhoneNumber('054-228-4283')); // צפוי: 972542284283
console.log(normalizePhoneNumber('+972542284283')); // צפוי: 972542284283
console.log(normalizePhoneNumber('972542284283')); // צפוי: 972542284283
console.log(normalizePhoneNumber('00972542284283')); // צפוי: 972542284283
```

### בדיקה בפועל

כדי לבדוק במערכת הפעילה:

1. **הכנס למערכת** - http://localhost:3000
2. **צור תור חדש** עם מספר טלפון
3. **בדוק בלוגים** (console) - תראה את ההמרה:
   ```
   📱 Sending WhatsApp to: 054-228-4283 => 972542284283
   ```

## שימוש בקוד

### בשליחת WhatsApp

```typescript
import { sendWhatsAppMessage } from '@/lib/notifications/rappelsend';

// הפונקציה תנרמל אוטומטית
await sendWhatsAppMessage('0542284283', 'הודעת בדיקה');
// ישלח ל: 972542284283
```

### נרמול ידני

```typescript
import { normalizePhoneNumber } from '@/lib/notifications/rappelsend';
// או
import { normalizeIsraeliPhone } from '@/lib/utils';

const normalized = normalizePhoneNumber('054-228-4283');
console.log(normalized); // 972542284283
```

## יתרונות הפתרון

1. ✅ **תומך בכל הפורמטים הנפוצים** - עם מקפים, רווחים, סוגריים
2. ✅ **טיפול חכם** - מזהה אוטומטית את הפורמט
3. ✅ **לוג ברור** - רואים את ההמרה בקונסול
4. ✅ **אוטומטי** - לא צריך לשנות כלום בקוד הקיים
5. ✅ **מניעת שגיאות** - חותך מספרים ארוכים מדי
6. ✅ **פונקציות ציבוריות** - אפשר להשתמש בכל מקום

## מקרים מיוחדים

### מספרים לא ישראליים

הפונקציה מתמקדת במספרים ישראליים. אם יש צורך בתמיכה במדינות אחרות:

```typescript
// TODO: הוסף תמיכה במדינות נוספות
if (phone.startsWith('+1')) {
  // USA
  return normalizeUSPhone(phone);
} else if (phone.startsWith('+44')) {
  // UK
  return normalizeUKPhone(phone);
}
// else - ישראל (ברירת מחדל)
```

### אימות נוסף

מומלץ להוסיף אימות לפני שליחה:

```typescript
import { isValidIsraeliPhone, normalizeIsraeliPhone } from '@/lib/utils';

if (!isValidIsraeliPhone(phone)) {
  throw new Error('מספר טלפון לא תקין');
}

const normalized = normalizeIsraeliPhone(phone);
await sendWhatsAppMessage(normalized, message);
```

## עדכונים עתידיים

- [ ] הוספת תמיכה במדינות נוספות
- [ ] אימות מתקדם (בדיקת קידומות תקפות)
- [ ] זיהוי אוטומטי של סוג המספר (נייד/קווי)
- [ ] cache למספרים שכבר נורמלו

