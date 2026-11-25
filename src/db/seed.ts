import bcrypt from 'bcryptjs';
import { count, eq, notInArray } from 'drizzle-orm';
import { db } from './index.ts';
import { agricultureItems, farmerProfiles, schemes, users } from './schema.ts';
import { INITIAL_AGRICULTURE_ITEMS, INITIAL_SCHEMES } from './seedData.ts';

let seedPromise: Promise<void> | null = null;
let seeded = false;

const DEPRECATED_SCHEME_SLUGS = [
  'karnataka-krishi-bhagya',
  'karnataka-krishi-yantradhare',
  'andaman-nicobar-agri-horticulture-scheme',
  'chandigarh-urban-agri-input-subsidy',
  'dnh-dd-farmer-welfare-mechanization',
  'delhi-soil-health-farmer-welfare',
  'jammu-kashmir-hadp-kisan-sathi',
  'jammu-kashmir-daksh-kisan-mission',
  'ladakh-winter-greenhouse-modi-scheme',
  'lakshadweep-coconut-organic-farming',
  'puducherry-farmer-crop-input-subsidy',
];

async function runSeed() {
  const existingSchemes = await db
    .select({
      slug: schemes.slug,
      stateName: schemes.stateName,
      officialUrl: schemes.officialUrl,
      logoUrl: schemes.logoUrl,
      lastVerifiedDate: schemes.lastVerifiedDate,
    })
    .from(schemes);

  const existingMap = new Map(existingSchemes.map((s) => [s.slug, s]));

  for (const deprecatedSlug of DEPRECATED_SCHEME_SLUGS) {
    if (existingMap.has(deprecatedSlug)) {
      await db.delete(schemes).where(eq(schemes.slug, deprecatedSlug));
      existingMap.delete(deprecatedSlug);
    }
  }

  const missingSchemes = INITIAL_SCHEMES.filter((item) => !existingMap.has(item.slug));
  const changedSchemes = INITIAL_SCHEMES.filter((item) => {
    const current = existingMap.get(item.slug);
    return (
      current &&
      (current.stateName !== item.stateName ||
        current.officialUrl !== item.officialUrl ||
        current.logoUrl !== item.logoUrl ||
        current.lastVerifiedDate !== item.lastVerifiedDate)
    );
  });

  if (missingSchemes.length > 0) {
    await db
      .insert(schemes)
      .values(
        missingSchemes.map((item) => ({
          slug: item.slug,
          name: item.name,
          shortName: item.shortName,
          governmentLevel: item.governmentLevel,
          stateName: item.stateName,
          category: item.category,
          targetCategories: item.targetCategories,
          overview: item.overview,
          objectives: item.objectives,
          benefits: item.benefits,
          eligibilitySummary: item.eligibilitySummary,
          eligibilityRules: item.eligibilityRules,
          requiredDocuments: item.requiredDocuments,
          applicationProcedure: item.applicationProcedure,
          officialUrl: item.officialUrl,
          logoUrl: item.logoUrl,
          lastVerifiedDate: item.lastVerifiedDate,
          isPopular: item.isPopular,
        }))
      )
      .onConflictDoNothing({ target: schemes.slug });
  }

  if (changedSchemes.length > 0) {
    await Promise.all(
      changedSchemes.map((item) =>
        db
          .update(schemes)
          .set({
            name: item.name,
            shortName: item.shortName,
            governmentLevel: item.governmentLevel,
            stateName: item.stateName,
            category: item.category,
            targetCategories: item.targetCategories,
            overview: item.overview,
            objectives: item.objectives,
            benefits: item.benefits,
            eligibilitySummary: item.eligibilitySummary,
            eligibilityRules: item.eligibilityRules,
            requiredDocuments: item.requiredDocuments,
            applicationProcedure: item.applicationProcedure,
            officialUrl: item.officialUrl,
            logoUrl: item.logoUrl,
            lastVerifiedDate: item.lastVerifiedDate,
            isPopular: item.isPopular,
          })
          .where(eq(schemes.slug, item.slug))
      )
    );
  }

  const [{ value: agriCount }] = await db
    .select({ value: count() })
    .from(agricultureItems);

  const existingAgri = await db
    .select({ slug: agricultureItems.slug, imageUrl: agricultureItems.imageUrl })
    .from(agricultureItems);
  const existingAgriMap = new Map(existingAgri.map((a) => [a.slug, a]));

  if (Number(agriCount) !== INITIAL_AGRICULTURE_ITEMS.length) {
    const validAgriSlugs = INITIAL_AGRICULTURE_ITEMS.map((i) => i.slug);
    if (validAgriSlugs.length > 0 && Number(agriCount) > 0) {
      await db
        .delete(agricultureItems)
        .where(notInArray(agricultureItems.slug, validAgriSlugs));
    }

    const missingAgri = INITIAL_AGRICULTURE_ITEMS.filter((i) => !existingAgriMap.has(i.slug));

    if (missingAgri.length > 0) {
      const INSERT_CHUNK = 100;
      for (let i = 0; i < missingAgri.length; i += INSERT_CHUNK) {
        const batch = missingAgri.slice(i, i + INSERT_CHUNK);
        await db
          .insert(agricultureItems)
          .values(
            batch.map((item) => ({
              slug: item.slug,
              section: item.section,
              title: item.title,
              subtitle: item.subtitle,
              summary: item.summary,
              imageUrl: item.imageUrl,
              details: item.details,
              highlights: item.highlights,
            }))
          )
          .onConflictDoNothing({ target: agricultureItems.slug });
      }
    }
  }

  const staleAgri = INITIAL_AGRICULTURE_ITEMS.filter((item) => {
    const dbItem = existingAgriMap.get(item.slug);
    return dbItem && dbItem.imageUrl !== item.imageUrl;
  });

  if (staleAgri.length > 0) {
    const CHUNK = 25;
    for (let i = 0; i < staleAgri.length; i += CHUNK) {
      await Promise.all(
        staleAgri.slice(i, i + CHUNK).map((item) =>
          db
            .update(agricultureItems)
            .set({ imageUrl: item.imageUrl })
            .where(eq(agricultureItems.slug, item.slug))
        )
      );
    }
  }

  // Ensure demo admin account exists for project evaluation
  const adminEmail = 'admin@farmerportal.edu';
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash('Admin@2026', 10);
    const [insertedAdmin] = await db
      .insert(users)
      .values({
        uid: 'local_admin_portal',
        email: adminEmail,
        fullName: 'Portal Administrator',
        mobileNumber: '9000000000',
        passwordHash: hash,
        role: 'admin',
      })
      .onConflictDoNothing({ target: users.email })
      .returning();

    if (insertedAdmin) {
      await db
        .insert(farmerProfiles)
        .values({
          userId: insertedAdmin.id,
          fullName: insertedAdmin.fullName,
          state: 'Karnataka',
          district: 'Bengaluru Urban',
          farmerCategory: 'Small (1-2 ha)',
          landHoldingAcres: '3.5',
          mainCrop: 'Ragi',
          irrigationAvailability: 'Borewell / Drip',
          farmingType: 'Mixed (Organic & Modern)',
        })
        .onConflictDoNothing({ target: farmerProfiles.userId });
    }
  }

  seeded = true;
}

export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  if (!seedPromise) {
    seedPromise = runSeed().finally(() => {
      seedPromise = null;
    });
  }
  await seedPromise;
}
