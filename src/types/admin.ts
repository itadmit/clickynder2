import { User, Business, Subscription, Package } from '@prisma/client';

export type UserWithBusinesses = User & {
  ownedBusinesses: (Business & {
    subscription: (Subscription & { package: Package }) | null;
    appointments: { id: string }[];
  })[];
  isSuperAdmin?: boolean;
};

