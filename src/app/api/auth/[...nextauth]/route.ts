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
        try {
          const res = await fetch(
            `${process.env.BACKEND_URL}/api/auth/token/login/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(credentials),
            }
          );

          if (!res.ok) {
            throw new Error("Failed to log in");
          }

          const user = await res.json();

          const UserDataRes = await fetch(
            `${process.env.BACKEND_URL}/api/auth/users/me/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${user.auth_token}`,
              },
            }
          );
          if (!UserDataRes.ok) {
            throw new Error("Failed to fetch user data");
          }
          const UserData = await UserDataRes.json();
          cookies().set("auth_token", user.auth_token, {
            httpOnly: true,
            sameSite: "lax", // Adjust this based on your requirements
            path: "/",
            secure: process.env.NODE_ENV === "production",
          });
          return { ...user, username: UserData.username };
        } catch (error) {
          console.error("Error logging in:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const authToken = cookies().get("auth_token")?.value;
      if (authToken) {
        token.auth_token = authToken;
      }

      if (user && "auth_token" in user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      return {
        ...session,
        user: token.user,
        accessToken: token.auth_token,
      };
    },
  },
  events:{
    async signOut({ }) {
      cookies().set("auth_token", "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
      });
    }
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

export const { GET } = handlers;
export const { POST } = handlers;
