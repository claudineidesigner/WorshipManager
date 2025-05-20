import {
  pgTable,
  text,
  varchar,
  serial,
  integer,
  boolean,
  date,
  time,
  timestamp,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  phone: text("phone"),
  birthDate: date("birth_date"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Ministries (worship teams)
export const ministries = pgTable("ministries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  createdBy: varchar("created_by").notNull(), // User ID reference
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  logo: text("logo"), // URL ou caminho para o logo
});

export const insertMinistrySchema = createInsertSchema(ministries).omit({
  id: true,
});

// Ministry Members (connecting users to ministries with roles)
export const ministryMembers = pgTable("ministry_members", {
  id: serial("id").primaryKey(),
  ministryId: integer("ministry_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(), // Líder, Admin, Membro
  position: text("position"), // Posições: Ministro, Vocal, Violão, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMinistryMemberSchema = createInsertSchema(ministryMembers).omit({
  id: true,
});

// Songs
export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  ministryId: integer("ministry_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist"),
  key: text("key"),
  bpm: integer("bpm"),
  duration: text("duration"),
  category: text("category"), // Worship, Praise, etc.
  chordLink: text("chord_link"),
  lyricsLink: text("lyrics_link"),
  audioLink: text("audio_link"),
  videoLink: text("video_link"),
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
});

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  ministryId: integer("ministry_id").notNull(),
  name: text("name").notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  type: text("type"), // Sunday Service, Midweek, etc.
  notes: text("notes"),
  status: text("status").default("pending"), // pending, ready, completed
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

// Service Team Members
export const serviceMembers = pgTable("service_members", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  userId: varchar("user_id").notNull(),
  position: text("position").notNull(), // Função específica neste culto
  status: text("status").default("confirmado"), // confirmado, pendente, indisponível
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceMemberSchema = createInsertSchema(serviceMembers).omit({
  id: true,
});

// Service Songs
export const serviceSongs = pgTable("service_songs", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  songId: integer("song_id").notNull(),
  order: integer("order").notNull(),
  key: text("key"), // Can override the default key
});

export const insertServiceSongSchema = createInsertSchema(serviceSongs).omit({
  id: true,
});

// Availability
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ministryId: integer("ministry_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  notes: text("notes"),
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  ministryId: integer("ministry_id").notNull(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id"), // Null for group messages
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Ministry = typeof ministries.$inferSelect;
export type InsertMinistry = z.infer<typeof insertMinistrySchema>;

export type MinistryMember = typeof ministryMembers.$inferSelect;
export type InsertMinistryMember = z.infer<typeof insertMinistryMemberSchema>;

export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type ServiceMember = typeof serviceMembers.$inferSelect;
export type InsertServiceMember = z.infer<typeof insertServiceMemberSchema>;

export type ServiceSong = typeof serviceSongs.$inferSelect;
export type InsertServiceSong = z.infer<typeof insertServiceSongSchema>;

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
