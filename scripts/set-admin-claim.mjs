// Gives a Firebase Auth user the custom claims the content panel needs in Supabase Storage:
//   role: 'authenticated'  -> Supabase uses the `authenticated` Postgres role (third-party auth)
//   admin: true            -> supabase/storage.sql only lets admins write to the `media` bucket
//
// Usage (run once per administrator, from this folder):
//   GOOGLE_APPLICATION_CREDENTIALS=~/.config/manugrafias/firebase-admin.json \
//     node scripts/set-admin-claim.mjs admin@example.com
//
// The service account key is a secret: keep it outside the repository.
// The user must sign out and in again (or force-refresh the ID token) to receive the new claims.

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/set-admin-claim.mjs <admin email>');
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: 'manugrafias-2026' });
const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), role: 'authenticated', admin: true });
console.log(`Claims set for ${email} (uid ${user.uid}): role=authenticated, admin=true`);
