import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authAPI } from "../lib/api"; // Your custom login/register API

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          if (credentials.isSignUp === "true") {
            if (!credentials.name) {
              throw new Error("Name is required for sign up");
            }

            const response = await authAPI.register({
              name: credentials.name,
              email: credentials.email,
              password: credentials.password,
              status: "online",
            });

            const user = response.data;

            return {
              id: user?.id,
              name: user?.name,
              email: user?.email,
              image: user?.avatarUrl,
              status: user?.status,
            };
          } else {
            const response = await authAPI.login({
              email: credentials.email,
              password: credentials.password,
            });

            const { user, token } = (response.data as any).data;
            if (!user || !token) {
              console.error("Authorize - Missing user or token in response");
              return null;
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.avatarUrl,
              status: user.status,
              accessToken: token,
            };
          }
        } catch (error: any) {
          console.error("Authentication error:", error);
          throw new Error(
            error?.response?.data?.message || "Authentication failed"
          );
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.status = (user as any).status;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) session.user = {} as any;

      // Expose user info
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture;
      (session.user as any).status = token.status;

      // Expose backend JWT
      (session as any).accessToken = token.accessToken;

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
