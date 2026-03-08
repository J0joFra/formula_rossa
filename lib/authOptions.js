/**
 * lib/authOptions.js
 * ─────────────────────────────────────────────────────────────────────────────
 * authOptions separato così può essere importato dalle API route
 * senza problemi con il filename dinamico [...nextauth].js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
};