import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
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
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/signin",
    error: "/error",
    newUser: "/signup",
    verifyRequest: "/verify-request",
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        id: { label: "Id", type: "text" },
        email: { label: "Email", type: "text", placeholder: "Jhondoe" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text", placeholder: "Jhon Doe" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email or password");
        }

        const user = await prisma.users.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.password) {
          throw new Error("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return user;
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
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || (user as any).sub || token.id || token.sub || "";
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id || token.sub || "";
      }
      return session;
    },
  },
};
