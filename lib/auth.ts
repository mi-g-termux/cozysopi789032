import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { minutesUntil } from "@/lib/utils";
import { sendLockoutAlert } from "@/lib/mail";

const EIGHT_HOURS = 60 * 60 * 8;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * A typed error thrown from authorize() so the login page can show
 * friendly, specific messages (locked / not found / 2FA required, etc.).
 */
export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: EIGHT_HOURS },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
        remember: {},
        totp: {},
      },
      async authorize(raw) {
        const email = String(raw?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(raw?.password ?? "");
        const totp = raw?.totp ? String(raw.totp) : "";

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
          throw new AuthError("NO_ACCOUNT", "No account found. Register?");

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const mins = minutesUntil(user.lockedUntil);
          throw new AuthError("LOCKED", `Account locked. Try in ${mins} min`);
        }

        if (!user.emailVerified) {
          throw new AuthError("UNVERIFIED", "Please verify your email first.");
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          const attempts = user.failedLoginAttempts + 1;
          const lock = attempts >= 5;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: lock ? 0 : attempts,
              lockedUntil: lock ? new Date(Date.now() + 60 * 60 * 1000) : null,
            },
          });
          if (lock) {
            await sendLockoutAlert(user.email, "unknown");
            throw new AuthError("LOCKED", "Account locked. Try in 60 min");
          }
          throw new AuthError("BAD_PASSWORD", "Incorrect email or password.");
        }

        if (user.twoFactorEnabled) {
          if (!totp)
            throw new AuthError("2FA_REQUIRED", "Enter your 2FA code.");
          const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret ?? "",
            encoding: "base32",
            token: totp,
            window: 1,
          });
          if (!verified)
            throw new AuthError("2FA_INVALID", "Invalid 2FA code.");
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          remember: String(raw?.remember ?? "") === "true",
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Respect the admin toggle: block Google sign-in when it is disabled.
      if (account?.provider === "google") {
        const settings = await prisma.settings.findUnique({
          where: { id: "singleton" },
        });
        if (!settings?.googleAuthEnabled) return false;
      }
      // Google sign-in: auto-verify and link/create the local account.
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          await prisma.user.update({
            where: { email },
            data: {
              emailVerified: true,
              provider: "google",
              lastLoginAt: new Date(),
            },
          });
        } else {
          await prisma.user.create({
            data: {
              email,
              name: user.name ?? null,
              password: "",
              emailVerified: true,
              provider: "google",
              lastLoginAt: new Date(),
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
        }
        if ((user as any).remember) {
          token.maxAge = THIRTY_DAYS;
        }
      }
      if (trigger === "update") {
        // allow session refresh
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
});

/** Convenience: get the current session's user or null. */
export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Throw-safe admin guard for route handlers. */
export async function requireAdmin() {
  const user = await currentUser();
  if (!user || (user as any).role !== "admin") return null;
  return user;
}
