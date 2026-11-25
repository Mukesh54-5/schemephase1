import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export interface EligibilityRulesJson {
  states?: string[];
  farmerCategories?: string[];
  maxLandAcres?: number;
  minLandAcres?: number;
  farmingTypes?: string[];
  notes: string[];
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  mobileNumber: text('mobile_number'),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('farmer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const farmerProfiles = pgTable('farmer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  fullName: text('full_name').notNull(),
  age: integer('age'),
  gender: text('gender'),
  state: text('state'),
  district: text('district'),
  village: text('village'),
  farmerCategory: text('farmer_category'),
  landHoldingAcres: text('land_holding_acres'),
  mainCrop: text('main_crop'),
  irrigationAvailability: text('irrigation_availability'),
  farmingType: text('farming_type'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const schemes = pgTable('schemes', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  governmentLevel: text('government_level').notNull(), // 'Central' | 'Karnataka'
  stateName: text('state_name').notNull().default('All India'),
  category: text('category').notNull(),
  targetCategories: jsonb('target_categories').$type<string[]>().notNull(),
  overview: text('overview').notNull(),
  objectives: jsonb('objectives').$type<string[]>().notNull(),
  benefits: text('benefits').notNull(),
  eligibilitySummary: text('eligibility_summary').notNull(),
  eligibilityRules: jsonb('eligibility_rules').$type<EligibilityRulesJson>().notNull(),
  requiredDocuments: jsonb('required_documents').$type<string[]>().notNull(),
  applicationProcedure: jsonb('application_procedure').$type<string[]>().notNull(),
  officialUrl: text('official_url').notNull(),
  logoUrl: text('logo_url'),
  lastVerifiedDate: text('last_verified_date').notNull(),
  isPopular: boolean('is_popular').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const agricultureItems = pgTable('agriculture_items', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  section: text('section').notNull(), // 'crop' | 'soil' | 'animal' | 'organic' | 'inorganic' | 'technology'
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  summary: text('summary').notNull(),
  imageUrl: text('image_url'),
  details: jsonb('details').$type<Record<string, string>>().notNull(),
  highlights: jsonb('highlights').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatConversations = pgTable('chat_conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionKey: text('session_key').notNull(),
  title: text('title').notNull().default('Farmer Assistant Chat'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id')
    .references(() => chatConversations.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const recentlyViewedSchemes = pgTable('recently_viewed_schemes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  schemeId: integer('scheme_id')
    .references(() => schemes.id, { onDelete: 'cascade' })
    .notNull(),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(farmerProfiles, {
    fields: [users.id],
    references: [farmerProfiles.userId],
  }),
  conversations: many(chatConversations),
  recentlyViewed: many(recentlyViewedSchemes),
}));

export const farmerProfilesRelations = relations(farmerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [farmerProfiles.userId],
    references: [users.id],
  }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatConversations.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

export const recentlyViewedSchemesRelations = relations(recentlyViewedSchemes, ({ one }) => ({
  user: one(users, {
    fields: [recentlyViewedSchemes.userId],
    references: [users.id],
  }),
  scheme: one(schemes, {
    fields: [recentlyViewedSchemes.schemeId],
    references: [schemes.id],
  }),
}));
