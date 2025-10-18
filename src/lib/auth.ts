/**
 * NextAuth Configuration
 * הגדרות אימות משתמשים
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // Credentials Provider (Email/Phone & Password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'אימייל או טלפון', type: 'text' },
        password: { label: 'סיסמה', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('נא למלא אימייל/טלפון וסיסמה');
        }

        // בדיקה אם זה אימייל או טלפון
        const isEmail = credentials.identifier.includes('@');
        
        const user = await prisma.user.findUnique({
          where: isEmail 
            ? { email: credentials.identifier }
            : { phone: credentials.identifier.replace(/[-\s]/g, '') }, // נרמול טלפון
        });

        if (!user) {
          throw new Error('משתמש לא נמצא');
        }

        if (!user.passwordHash) {
          throw new Error('משתמש זה נרשם דרך Google. אנא התחבר דרך Google');
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('סיסמה שגויה');
        }

        // עדכון זמן התחברות אחרון
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // אם זה התחברות דרך Google
      if (account?.provider === 'google') {
        try {
          // בדוק אם המשתמש כבר קיים
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { ownedBusinesses: true },
          });

          if (existingUser) {
            // עדכן את זמן ההתחברות
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            });
            return true;
          }

          // אם המשתמש לא קיים, צריך להפנות להרשמה
          // כרגע נאפשר התחברות רק למשתמשים קיימים
          return '/auth/register?error=please-register';
        } catch (error) {
          console.error('Error in Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        
        // בדיקה אם המשתמש הוא Super Admin
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isSuperAdmin: true },
        });
        token.isSuperAdmin = dbUser?.isSuperAdmin || false;
      }
      
      // אם זו התחברות Google, שמור מידע נוסף
      if (account?.provider === 'google') {
        token.provider = 'google';
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).isSuperAdmin = token.isSuperAdmin || false;
      }
      return session;
    },
  },
};

