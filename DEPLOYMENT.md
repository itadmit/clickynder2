# 🚀 מדריך פריסה - Clickynder

## סקריפטים זמינים

### 🔥 פריסה מלאה (מומלץ)
```bash
./deploy-full.sh
```

**מה זה עושה:**
1. Git commit & push (אופציונלי)
2. Prisma generate
3. Database migrations לפרודקשן
4. Docker build
5. Upload image לשרת
6. Deploy + restart services (app + worker)

**זמן משוער:** 3-5 דקות

---

### 💻 פיתוח מקומי
```bash
./dev.sh
```

**מה זה עושה:**
- הורג תהליך קיים על port 3000
- מפעיל `npm run dev`

---

## תהליך פריסה רגיל

### שלב 1: פיתוח מקומי
```bash
# התחל שרת פיתוח
./dev.sh

# עבוד על הקוד...
# בדוק ב-http://localhost:3000
```

### שלב 2: פריסה לייצור
```bash
# הרץ את הסקריפט המלא
./deploy-full.sh

# הזן commit message כשמתבקש
# או לחץ Enter לדלג על git commit
```

### שלב 3: בדיקה
```bash
# בדוק את האתר
open https://clickynder.com

# צפה בלוגים
ssh contabo 'sudo docker logs clickynder_app -f'
ssh contabo 'sudo docker logs clickynder_worker -f'
```

---

## פקודות שימושיות

### צפייה בלוגים
```bash
# לוגים של האפליקציה
ssh contabo 'sudo docker logs clickynder_app -f'

# לוגים של ה-Worker (תזכורות)
ssh contabo 'sudo docker logs clickynder_worker -f'

# כל הלוגים ביחד
ssh contabo 'cd ~/app && sudo docker-compose -f docker-compose.prod.yml logs -f'
```

### הפעלה מחדש
```bash
# הפעלה מחדש של כל השירותים
ssh contabo 'cd ~/app && sudo docker-compose -f docker-compose.prod.yml restart'

# רק האפליקציה
ssh contabo 'sudo docker restart clickynder_app'

# רק ה-Worker
ssh contabo 'sudo docker restart clickynder_worker'
```

### בדיקת סטטוס
```bash
# סטטוס כל השירותים
ssh contabo 'cd ~/app && sudo docker-compose -f docker-compose.prod.yml ps'

# שימוש במשאבים
ssh contabo 'sudo docker stats'
```

### מיגרציות מסד נתונים
```bash
# יצירת מיגרציה חדשה (מקומי)
npx prisma migrate dev --name my_migration_name

# הרצה בפרודקשן (אוטומטי ב-deploy-full.sh)
DATABASE_URL="postgresql://clickinder:clickinder123@clickynder.com:5432/clickinder?schema=public" \
  npx prisma migrate deploy
```

---

## מבנה Docker

המערכת רצה ב-3 containers:

1. **clickynder_db** - PostgreSQL database
2. **clickynder_app** - Next.js application (port 3000)
3. **clickynder_worker** - Background worker לתזכורות (כל 15 דקות)

כולם מנוהלים על ידי `docker-compose.prod.yml`.

---

## פתרון בעיות

### הבניה נכשלת
```bash
# נקה Docker cache
docker system prune -a

# בנה שוב
./deploy-full.sh
```

### האתר לא עובד
```bash
# בדוק לוגים
ssh contabo 'sudo docker logs clickynder_app --tail 100'

# הפעל מחדש
ssh contabo 'cd ~/app && sudo docker-compose -f docker-compose.prod.yml restart'
```

### תזכורות לא נשלחות
```bash
# בדוק אם ה-Worker רץ
ssh contabo 'sudo docker ps | grep worker'

# בדוק לוגים
ssh contabo 'sudo docker logs clickynder_worker -f'

# הפעל מחדש את ה-Worker
ssh contabo 'sudo docker restart clickynder_worker'
```

### בעיות מסד נתונים
```bash
# התחבר למסד הנתונים
ssh contabo 'sudo docker exec -it clickynder_db psql -U clickinder -d clickinder'

# בדוק migrations
\dt

# צא
\q
```

---

## עדכון תלויות

```bash
# עדכן package.json מקומית
npm install <package-name>

# או
npm update

# הרץ פריסה
./deploy-full.sh
```

---

## גיבוי מסד נתונים

```bash
# יצירת גיבוי
ssh contabo 'sudo docker exec clickynder_db pg_dump -U clickinder clickinder > backup_$(date +%Y%m%d).sql'

# שחזור מגיבוי
ssh contabo 'sudo docker exec -i clickynder_db psql -U clickinder clickinder < backup.sql'
```

---

## סביבת פיתוח vs ייצור

| תכונה | פיתוח (`./dev.sh`) | ייצור (`./deploy-full.sh`) |
|-------|-------------------|--------------------------|
| Database | Local PostgreSQL | Remote PostgreSQL |
| Hot Reload | ✅ כן | ❌ לא |
| Build | לא צריך | ✅ מלא |
| Docker | לא | ✅ כן |
| Worker | לא רץ | ✅ רץ אוטומטית |

---

## קבצי תצורה חשובים

- `docker-compose.prod.yml` - הגדרות Docker לייצור
- `.env.production` - משתני סביבה לייצור (בשרת)
- `.env` - משתני סביבה לפיתוח (מקומי)
- `prisma/schema.prisma` - סכמת מסד הנתונים
- `worker/reminders-worker.js` - Worker לתזכורות

---

## תמיכה

אם יש בעיה:
1. בדוק את הלוגים
2. נסה restart
3. בדוק את ה-issues ב-GitHub
4. פנה למפתח
