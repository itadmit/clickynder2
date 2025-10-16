import { User, Business } from '@prisma/client';

export type UserWithBusinesses = User & {
  businesses: Business[];
  isSuperAdmin?: boolean;
};

