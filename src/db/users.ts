import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { farmerProfiles, users } from './schema.ts';

export async function getOrCreateFirebaseUser(
  uid: string,
  email: string,
  fullName?: string
) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const byEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (byEmail.length > 0) {
      const updated = await db
        .update(users)
        .set({ uid, fullName: fullName || byEmail[0].fullName })
        .where(eq(users.id, byEmail[0].id))
        .returning();
      return updated[0];
    }

    const displayName = fullName || normalizedEmail.split('@')[0] || 'Farmer User';
    const inserted = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        fullName: displayName,
        role: 'farmer',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email: normalizedEmail },
      })
      .returning();

    const userRecord = inserted[0];

    await db
      .insert(farmerProfiles)
      .values({
        userId: userRecord.id,
        fullName: userRecord.fullName,
      })
      .onConflictDoNothing({ target: farmerProfiles.userId });

    return userRecord;
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}
