# 🚀 Clickynder Deployment Guide

## תהליך הפיתוח והפריסה

### 🔧 פיתוח מקומי

```bash
# 1. התקנת תלויות (רק בפעם הראשונה)
npm install

# 2. הרצת שרת פיתוח
npm run dev

# 3. פתח בדפדפן
open http://localhost:3000
```

---

## 🌐 פריסה לשרת Production

יש לך **2 אפשרויות** לפריסה:

### אפשרות 1: Deploy מלא (מומלץ!) ⚡
**מתי להשתמש:** שינויים גדולים, אופטימיזציה, גרסה חדשה

**מה קורה:**
1. ✅ בנייה מקומית של Docker image (מהירה!)
2. ✅ דחיסה והעלאה לשרת
3. ✅ הרצה אוטומטית

**איך לעשות:**
```bash
./deploy.sh
```

**זמן:** ~3-5 דקות (תלוי במהירות האינטרנט)

---

### אפשרות 2: Quick Deploy 🏃
**מתי להשתמש:** תיקוני באגים קטנים, שינויי CSS, עדכון טקסטים

**מה קורה:**
1. ✅ העלאת רק הקבצים ששונו
2. ✅ בנייה מחדש בשרת
3. ✅ restart אוטומטי

**איך לעשות:**
```bash
./deploy-quick.sh
```

**זמן:** ~30 שניות - 2 דקות

---

## 📋 תהליך עבודה מומלץ

### תסריט יומיומי:

```bash
# בוקר - התחלת עבודה
npm run dev

# פיתוח פיתוח פיתוח... ☕

# סיימת פיצ'ר? בדוק מקומית
npm run build  # ודא שהכל עובד

# פרוס לשרת
./deploy.sh

# או אם זה שינוי קטן:
./deploy-quick.sh
```

---

## 🔍 פקודות שימושיות

### בדיקת סטטוס
```bash
# בדוק שהאפליקציה רצה
ssh contabo "sudo docker ps"

# צפה בלוגים בזמן אמת
ssh contabo "sudo docker logs clickynder_app -f"

# בדוק שהאתר מגיב
curl -I https://clickynder.com
```

### ניהול מסד נתונים
```bash
# הרץ migration חדש
ssh contabo "cd /home/clickynder/app && sudo docker exec clickynder_app npx prisma migrate deploy"

# פתח Prisma Studio (מרחוק)
ssh -L 5555:localhost:5555 contabo "cd /home/clickynder/app && sudo docker exec -it clickynder_app npx prisma studio"
# עכשיו פתח: http://localhost:5555
```

### Restart מהיר
```bash
# רק restart (ללא build)
ssh contabo "cd /home/clickynder/app && sudo docker compose -f docker-compose.prod.yml restart app"

# עצור הכל
ssh contabo "cd /home/clickynder/app && sudo docker compose -f docker-compose.prod.yml down"

# הפעל מחדש הכל
ssh contabo "cd /home/clickynder/app && sudo docker compose -f docker-compose.prod.yml up -d"
```

---

## 🔐 עדכון משתני סביבה

אם צריך לשנות משתנים ב-`.env.production`:

```bash
# 1. ערוך מקומית
nano .env.production

# 2. העלה לשרת
rsync -avz .env.production contabo:/home/clickynder/app/

# 3. restart
ssh contabo "cd /home/clickynder/app && sudo docker compose -f docker-compose.prod.yml restart app"
```

---

## 🆘 פתרון בעיות

### האתר לא עולה?
```bash
# בדוק שה-containers רצים
ssh contabo "sudo docker ps"

# צפה בשגיאות
ssh contabo "sudo docker logs clickynder_app --tail 100"

# restart הכל
ssh contabo "cd /home/clickynder/app && sudo docker compose -f docker-compose.prod.yml restart"
```

### בעיות עם מסד נתונים?
```bash
# בדוק שהDB רץ
ssh contabo "sudo docker exec clickynder_db pg_isready -U clickinder"

# התחבר ל-DB
ssh contabo "sudo docker exec -it clickynder_db psql -U clickinder -d clickinder"
```

### האתר איטי?
```bash
# בדוק שימוש במשאבים
ssh contabo "sudo docker stats"

# נקה images ישנים
ssh contabo "sudo docker image prune -a"
```

---

## 📊 ניטור

### בדיקת health
```bash
# HTTP status
curl -I https://clickynder.com

# זמן תגובה
curl -w "\nTime: %{time_total}s\n" -o /dev/null -s https://clickynder.com
```

### לוגים
```bash
# 50 שורות אחרונות
ssh contabo "sudo docker logs clickynder_app --tail 50"

# follow (real-time)
ssh contabo "sudo docker logs clickynder_app -f"

# לוגים של היום
ssh contabo "sudo docker logs clickynder_app --since 24h"
```

---

## 🎯 טיפים

### ✅ לפני deploy תמיד:
1. `npm run build` - ודא שהבנייה עוברת מקומית
2. בדוק ב-localhost:3000 שהכל עובד
3. עשה commit ל-Git (אם משתמש)
4. רק אז `./deploy.sh`

### ⚡ למהירות מקסימלית:
- שינויים קטנים: `./deploy-quick.sh`
- שינויים גדולים או dependencies חדשים: `./deploy.sh`

### 🔒 אבטחה:
- אל תעלה קבצי `.env` עם סודות ל-Git
- שמור backup של `.env.production` במקום בטוח
- עדכן את `NEXTAUTH_SECRET` לסוד אמיתי

---

## 🔄 Git Workflow (אופציונלי)

אם רוצה להוסיף Git:

```bash
# אתחול
git init
git add .
git commit -m "Initial commit"

# לינק ל-GitHub
git remote add origin <YOUR_REPO_URL>
git push -u origin main

# תהליך עבודה
git add .
git commit -m "הוספתי פיצ'ר X"
git push
./deploy.sh
```

---

**זה הכל! עכשיו אתה מוכן לפתח ולפרוס בביטחון! 🚀**

אם יש בעיות: `ssh contabo "sudo docker logs clickynder_app -f"`

