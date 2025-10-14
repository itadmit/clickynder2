/**
 * Database Seeder
 * מאכלס את מסד הנתונים בנתונים ראשוניים
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // יצירת חבילות
  const packages = await Promise.all([
    prisma.package.upsert({
      where: { code: 'starter' },
      update: {},
      create: {
        code: 'starter',
        name: 'Starter',
        maxBranches: 1,
        maxStaff: 3,
        monthlyAppointmentsCap: 100,
        priceCents: 0, // Free plan
        featuresJson: {
          features: [
            'עד 3 עובדים',
            'סניף אחד',
            'עד 100 תורים בחודש',
            'התראות בסיסיות',
          ],
        },
      },
    }),
    prisma.package.upsert({
      where: { code: 'pro' },
      update: {},
      create: {
        code: 'pro',
        name: 'Pro',
        maxBranches: 5,
        maxStaff: 10,
        monthlyAppointmentsCap: 500,
        priceCents: 19900, // ₪199/month
        featuresJson: {
          features: [
            'עד 10 עובדים',
            'עד 5 סניפים',
            'עד 500 תורים בחודש',
            'התראות מתקדמות',
            'אינטגרציות יומן',
            'דוחות ואנליטיקה',
          ],
        },
      },
    }),
    prisma.package.upsert({
      where: { code: 'ultra' },
      update: {},
      create: {
        code: 'ultra',
        name: 'Ultra',
        maxBranches: 20,
        maxStaff: 50,
        monthlyAppointmentsCap: 2000,
        priceCents: 49900, // ₪499/month
        featuresJson: {
          features: [
            'עד 50 עובדים',
            'עד 20 סניפים',
            'עד 2000 תורים בחודש',
            'כל התכונות של Pro',
            'תמיכה מועדפת',
            'API מותאם אישית',
            'White label',
          ],
        },
      },
    }),
    prisma.package.upsert({
      where: { code: 'enterprise' },
      update: {},
      create: {
        code: 'enterprise',
        name: 'Enterprise',
        maxBranches: 999,
        maxStaff: 999,
        monthlyAppointmentsCap: 999999,
        priceCents: 99900, // ₪999/month
        featuresJson: {
          features: [
            'עובדים וסניפים ללא הגבלה',
            'תורים ללא הגבלה',
            'כל התכונות',
            'תמיכה 24/7',
            'מנהל חשבון ייעודי',
            'הדרכה והטמעה',
            'התאמות מיוחדות',
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${packages.length} packages`);

  // יצירת תבניות התראות ברירת מחדל
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

