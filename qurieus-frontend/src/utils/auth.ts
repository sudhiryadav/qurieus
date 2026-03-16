import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prismaDB";
import type { Adapter } from "next-auth/adapters";
import { createTransport } from "nodemailer";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      role: string;
      hasPassword: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/signin",
    error: "/error",
    newUser: "/signup",
    verifyRequest: "/verify-request",
  },
  adapter: PrismaAdapter(prisma as any) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Use default cookies - custom config can break __Secure- prefix in prod
  debug: process.env.NODE_ENV === "development",

  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        id: { label: "Id", type: "text" },
        email: { label: "Email", type: "text", placeholder: "Jhondoe" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text", placeholder: "Jhon Doe" },
      },

      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Please enter an email");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error("Invalid email");
        }

        if (!user.is_verified) {
          throw new Error("Please verify your email before signing in");
        }

        if (!user.is_active) {
          throw new Error("Your account has been deactivated. Please contact support.");
        }

        // Special case for email verification
        if (credentials.password === "temp_password_for_verification") {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        if (!user?.password) {
          throw new Error("Please set a password for your account.");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!passwordMatch) {
          throw new Error("Incorrect username or password.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM_EMAIL,
      maxAge: 24 * 60 * 60, // How long email links are valid for (24 hours)
      sendVerificationRequest: async ({ identifier: email, url, provider: { server, from } }) => {
        const { host } = new URL(url);
        const transport = await createTransport(server);
        await transport.sendMail({
          to: email,
          from,
          subject: `Sign in to ${host}`,
          text: `Click here to sign in: ${url}`,
          html: `
            <div>
              <h1>Sign in to ${host}</h1>
              <p>Click the link below to sign in:</p>
              <a href="${url}">Sign in</a>
            </div>
          `,
        });
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "email" && user?.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { is_verified: true },
        });
      }
      if (account?.provider === "google" && user?.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { is_verified: true },
        });
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirects
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Check if user is still active on every JWT refresh
      if (token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
        if (!dbUser?.is_active) {
          throw new Error("Account deactivated");
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
        session.user.hasPassword = !!dbUser?.password;
        if (dbUser) {
          session.user.name = dbUser.name;
          session.user.image = dbUser.image ?? undefined;
        }
      }
      return session;
    },
  },
};
