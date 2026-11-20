import { cert, getApp, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

/**
 * Firebase Admin, for the server and the scripts only: verifies ID tokens and manages users.
 * FIREBASE_SERVICE_ACCOUNT holds the whole service account JSON file
 * (Project settings > Service accounts > Generate new private key).
 * NEVER import this from a Client Component.
 */
export function getAdminAuth(): Auth {
  if (getApps().length) return getAuth(getApp());

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");

  // The JSON uses snake_case keys (project_id, client_email, private_key); cert() accepts both forms.
  const serviceAccount = JSON.parse(raw) as ServiceAccount;
  return getAuth(initializeApp({ credential: cert(serviceAccount) }));
}
