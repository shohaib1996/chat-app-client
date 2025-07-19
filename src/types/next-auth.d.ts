import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
      status?: string;
      image?: string;
    } & DefaultSession['user'];
  }

  interface JWT {
    accessToken?: string;
    id?: string;
    status?: string;
    picture?: string;
  }
}
