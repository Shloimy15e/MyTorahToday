import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      username: string;
      auth_token: string;
    } & DefaultSession["user"];
  }
}
