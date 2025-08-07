/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import YandexProvider from "next-auth/providers/yandex";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID!,
      clientSecret: process.env.YANDEX_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);
        const transport = nodemailer.createTransport(provider.server);
        
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Вход на сайт ${host}`,
          text: `Перейдите по ссылке для входа: ${url}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Добро пожаловать в Прованс Декор!</h2>
              <p>Нажмите на кнопку ниже, чтобы войти на сайт:</p>
              <a href="${url}" style="display: inline-block; background: #E5D3B3; color: #333; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Войти на сайт
              </a>
              <p>Если кнопка не работает, скопируйте эту ссылку в браузер:</p>
              <p>${url}</p>
              <p>Эта ссылка действительна в течение 24 часов.</p>
            </div>
          `,
        });
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          if (user && await bcrypt.compare(credentials.password, user.password)) {
            return {
              id: user.id.toString(),
              name: user.username,
              role: user.role
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.role) {
        session.user.role = token.role;
      }
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
    async signIn({ user, account }: any) {
      // Для OAuth провайдеров создаем или обновляем пользователя
      if (account?.provider === 'google' || account?.provider === 'yandex') {
        try {
          let existingUser = await prisma.user.findFirst({
            where: { email: user.email }
          });

          if (!existingUser) {
            // Проверяем первого пользователя - делаем админом
            const userCount = await prisma.user.count();
            const role = userCount === 0 ? 'admin' : 'user';

            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                username: user.email,
                role: role,
                password: '', // Пустой пароль для OAuth пользователей
              }
            });
          }

          user.role = existingUser.role;
          user.id = existingUser.id.toString();
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    }
  },
  session: {
    strategy: "jwt" as const
  }
};

export default NextAuth(authOptions);
