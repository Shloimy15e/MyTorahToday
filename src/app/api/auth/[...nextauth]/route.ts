import NextAuth, { Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { signInSchema } from "@/lib/zod";

const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const res = await fetch(
          "https://mttbackend-production.up.railway.app/api/auth/token/login/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          }
        );

        const user = await res.json();

        if (res.ok && user) {
          const UserDataRes = await fetch(
            "https://mttbackend-production.up.railway.app/api/auth/users/me/",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${user.auth_token}`,
              },
            }
          );
          const UserData = await UserDataRes.json();
          cookies().set("auth_token", user.auth_token, {
            httpOnly: true,
            sameSite: "lax", // Adjust this based on your requirements
            path: "/",
            secure: process.env.NODE_ENV === "production",
          });
          return { ...user, username: UserData.username };
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "auth_token" in user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      return {
        ...session,
        user: token.user,
      };
    },
  },
});

export const { GET } = handlers;
export const { POST } = handlers;
