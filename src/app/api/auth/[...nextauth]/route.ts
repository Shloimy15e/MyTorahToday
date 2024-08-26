import NextAuth, { Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signInSchema } from "@/lib/zod";
// Your own logic for dealing with plaintext password strings; be careful!
//import { saltAndHashPassword } from "@/utils/password"
//import { getUserFromDb } from "@/utils/db"

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
          console.log("UserData", UserData);
          return { ...user, username: UserData.username, auth_token: user.auth_token };
        } else {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'auth_token' in user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token } : { session: Session, token: any }) {
      return {
        ...session,
        user: token.user,
      };
    },
  }
});

export const {GET} = handlers;
export const {POST} = handlers;
export { auth };