import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Non autenticato' });
  }

  try {
    const uid = session.user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const token = await admin.auth().createCustomToken(uid, {
      email: session.user.email,
      name: session.user.name,
    });
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Errore generazione token Firebase:', error);
    return res.status(500).json({ error: 'Errore interno' });
  }
}