# מערכת Skeleton Loaders

## 📋 סקירה כללית

הוספנו מערכת מלאה של Skeleton Loaders (טוענים מונפשים) לכל דפי הדשבורד.

## 🎯 מטרת המערכת

- **חוויית משתמש משופרת**: במקום spinner או מסך לבן, המשתמש רואה placeholder מונפש שמדמה את המבנה של הדף
- **תחושת מהירות**: הדף נראה כאילו הוא כבר טעון, רק מחכה לנתונים
- **עיצוב עקבי**: כל הדפים משתמשים באותו סגנון skeleton

## 📁 מבנה הקבצים

### קומפוננטים בסיסיים
`src/components/ui/Skeleton.tsx` - קומפוננטי הבסיס:
- `Skeleton` - קומפוננט בסיסי לכל סוג של skeleton
- `CardSkeleton` - skeleton לכרטיס כללי
- `TableSkeleton` - skeleton לטבלאות
- `StatCardSkeleton` - skeleton לכרטיסי סטטיסטיקה
- `DashboardSkeleton` - skeleton מלא לדף הדשבורד הראשי
- `ListPageSkeleton` - skeleton לדפי רשימות
- `FormPageSkeleton` - skeleton לדפי טפסים

### קבצי Loading
כל תיקייה בדשבורד מכילה `loading.tsx` שמוצג אוטומטית ע"י Next.js בזמן הטעינה:

#### דפים ראשיים:
- `src/app/dashboard/loading.tsx` - דף ראשי
- `src/app/dashboard/staff/loading.tsx` - עובדים
- `src/app/dashboard/services/loading.tsx` - שירותים
- `src/app/dashboard/branches/loading.tsx` - סניפים
- `src/app/dashboard/appointments/loading.tsx` - תורים
- `src/app/dashboard/customers/loading.tsx` - לקוחות
- `src/app/dashboard/settings/loading.tsx` - הגדרות
- `src/app/dashboard/analytics/loading.tsx` - אנליטיקס
- `src/app/dashboard/subscription/loading.tsx` - מנוי

#### דפי יצירה:
- `src/app/dashboard/staff/new/loading.tsx`
- `src/app/dashboard/services/new/loading.tsx`
- `src/app/dashboard/branches/new/loading.tsx`
- `src/app/dashboard/appointments/new/loading.tsx`

#### דפי פרטים:
- `src/app/dashboard/appointments/[id]/loading.tsx`
- `src/app/dashboard/customers/[id]/loading.tsx`

## 🎨 עיצוב

הסקלטונים משתמשים ב:
- **צבע**: `bg-gray-200` (אפור בהיר)
- **אנימציה**: `animate-pulse` של Tailwind
- **Border Radius**: `rounded` / `rounded-lg` / `rounded-full`
- **מבנה זהה**: כל skeleton משקף את המבנה האמיתי של הדף

## 💡 איך זה עובד?

### Server Components
Next.js מציג אוטומטית את `loading.tsx` בזמן שה-Server Component טוען.

```tsx
// loading.tsx יוצג אוטומטית כשמבקרים בדף
// page.tsx
export default async function MyPage() {
  const data = await fetchData(); // טוען...
  return <div>...</div>;
}
```

### Client Components
בקומפוננטים עם `'use client'` השתמשנו ב-skeleton inline:

```tsx
if (isLoading) {
  return <SkeletonComponent />;
}
```

## ✅ יתרונות

1. **חוויית משתמש טובה יותר** - לא רואים דף ריק או spinner
2. **תחושת ביצועים** - הדף נראה כאילו הוא טוען מהר יותר
3. **עיצוב מקצועי** - נראה כמו אפליקציות מודרניות (Facebook, LinkedIn)
4. **עקביות** - כל הדפים נראים דומים בזמן הטעינה
5. **נגישות** - ברור למשתמש שהמערכת עובדת

## 🔄 עדכונים עתידיים

ניתן להוסיף:
- טקסטים של "טוען..." עם אנימציית נקודות
- Shimmer effect (ברק שעובר על הסקלטון)
- Skeleton variants שונים לפי סוג התוכן
- Progressive loading (חלקים של הדף נטענים בהדרגה)

