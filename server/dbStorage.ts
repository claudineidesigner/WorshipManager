import { db } from "./db";
import { 
  users, 
  ministries,
  ministryMembers,
  songs,
  services,
  serviceMembers,
  serviceSongs,
  availability,
  messages,
  type User,
  type UpsertUser,
  type Ministry,
  type InsertMinistry,
  type MinistryMember,
  type InsertMinistryMember,
  type Song,
  type InsertSong,
  type Service,
  type InsertService,
  type ServiceMember,
  type InsertServiceMember,
  type ServiceSong,
  type InsertServiceSong,
  type Availability,
  type InsertAvailability,
  type Message,
  type InsertMessage
} from "@shared/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

// Classe de armazenamento para operações de banco de dados PostgreSQL
export class DatabaseStorage {
  // Operações de usuário (obrigatórias para autenticação Replit)
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Operações de ministério
  async getMinistry(id: number): Promise<Ministry | undefined> {
    const [ministry] = await db.select().from(ministries).where(eq(ministries.id, id));
    return ministry;
  }

  async getMinistryByCode(code: string): Promise<Ministry | undefined> {
    const [ministry] = await db.select().from(ministries).where(eq(ministries.code, code));
    return ministry;
  }

  async getMinistries(): Promise<Ministry[]> {
    return await db.select().from(ministries);
  }

  async getMinistryByUserId(userId: string): Promise<Ministry[]> {
    const memberMinistries = await db
      .select({
        ministry: ministries
      })
      .from(ministryMembers)
      .innerJoin(ministries, eq(ministryMembers.ministryId, ministries.id))
      .where(eq(ministryMembers.userId, userId));
    
    return memberMinistries.map(mm => mm.ministry);
  }

  async createMinistry(ministry: InsertMinistry): Promise<Ministry> {
    const [newMinistry] = await db
      .insert(ministries)
      .values(ministry)
      .returning();
    return newMinistry;
  }

  // Operações de membros de ministério
  async getMinistryMember(id: number): Promise<MinistryMember | undefined> {
    const [member] = await db.select().from(ministryMembers).where(eq(ministryMembers.id, id));
    return member;
  }

  async getMinistryMembers(ministryId: number): Promise<MinistryMember[]> {
    return await db
      .select()
      .from(ministryMembers)
      .where(eq(ministryMembers.ministryId, ministryId));
  }

  async getMinistryMembersByUserId(userId: string): Promise<MinistryMember[]> {
    return await db
      .select()
      .from(ministryMembers)
      .where(eq(ministryMembers.userId, userId));
  }

  async createMinistryMember(member: InsertMinistryMember): Promise<MinistryMember> {
    const [newMember] = await db
      .insert(ministryMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async updateMinistryMember(id: number, updates: Partial<MinistryMember>): Promise<MinistryMember | undefined> {
    const [updatedMember] = await db
      .update(ministryMembers)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(ministryMembers.id, id))
      .returning();
    return updatedMember;
  }

  async deleteMinistryMember(id: number): Promise<boolean> {
    const result = await db
      .delete(ministryMembers)
      .where(eq(ministryMembers.id, id));
    return result.count > 0;
  }

  // Operações de músicas
  async getSong(id: number): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song;
  }

  async getSongs(ministryId: number): Promise<Song[]> {
    return await db
      .select()
      .from(songs)
      .where(eq(songs.ministryId, ministryId));
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [newSong] = await db
      .insert(songs)
      .values(song)
      .returning();
    return newSong;
  }

  async updateSong(id: number, updates: Partial<Song>): Promise<Song | undefined> {
    const [updatedSong] = await db
      .update(songs)
      .set(updates)
      .where(eq(songs.id, id))
      .returning();
    return updatedSong;
  }

  async deleteSong(id: number): Promise<boolean> {
    const result = await db
      .delete(songs)
      .where(eq(songs.id, id));
    return result.count > 0;
  }

  // Operações de cultos/eventos
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServices(ministryId: number): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.ministryId, ministryId))
      .orderBy(desc(services.date));
  }

  async getUpcomingServices(ministryId: number): Promise<Service[]> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return await db
      .select()
      .from(services)
      .where(
        and(
          eq(services.ministryId, ministryId),
          gte(services.date, sql`CAST(${today} AS DATE)`)
        )
      )
      .orderBy(services.date);
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(service)
      .returning();
    return newService;
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db
      .delete(services)
      .where(eq(services.id, id));
    return result.count > 0;
  }

  // Operações de membros escalados
  async getServiceMember(id: number): Promise<ServiceMember | undefined> {
    const [member] = await db.select().from(serviceMembers).where(eq(serviceMembers.id, id));
    return member;
  }

  async getServiceMembers(serviceId: number): Promise<ServiceMember[]> {
    return await db
      .select()
      .from(serviceMembers)
      .where(eq(serviceMembers.serviceId, serviceId));
  }

  async createServiceMember(member: InsertServiceMember): Promise<ServiceMember> {
    const [newMember] = await db
      .insert(serviceMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async deleteServiceMember(id: number): Promise<boolean> {
    const result = await db
      .delete(serviceMembers)
      .where(eq(serviceMembers.id, id));
    return result.count > 0;
  }

  // Operações de músicas em cultos
  async getServiceSong(id: number): Promise<ServiceSong | undefined> {
    const [song] = await db.select().from(serviceSongs).where(eq(serviceSongs.id, id));
    return song;
  }

  async getServiceSongs(serviceId: number): Promise<ServiceSong[]> {
    return await db
      .select()
      .from(serviceSongs)
      .where(eq(serviceSongs.serviceId, serviceId))
      .orderBy(serviceSongs.order);
  }

  async createServiceSong(song: InsertServiceSong): Promise<ServiceSong> {
    const [newSong] = await db
      .insert(serviceSongs)
      .values(song)
      .returning();
    return newSong;
  }

  async updateServiceSongOrder(id: number, order: number): Promise<ServiceSong | undefined> {
    const [updatedSong] = await db
      .update(serviceSongs)
      .set({ order })
      .where(eq(serviceSongs.id, id))
      .returning();
    return updatedSong;
  }

  async deleteServiceSong(id: number): Promise<boolean> {
    const result = await db
      .delete(serviceSongs)
      .where(eq(serviceSongs.id, id));
    return result.count > 0;
  }

  // Operações de disponibilidade
  async getAvailability(id: number): Promise<Availability | undefined> {
    const [avail] = await db.select().from(availability).where(eq(availability.id, id));
    return avail;
  }

  async getUserAvailability(userId: number, ministryId: number): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.userId, userId),
          eq(availability.ministryId, ministryId)
        )
      );
  }

  async createAvailability(avail: InsertAvailability): Promise<Availability> {
    const [newAvail] = await db
      .insert(availability)
      .values(avail)
      .returning();
    return newAvail;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    const result = await db
      .delete(availability)
      .where(eq(availability.id, id));
    return result.count > 0;
  }

  // Operações de mensagens
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessages(ministryId: number, recipientId?: number): Promise<Message[]> {
    let query = db
      .select()
      .from(messages)
      .where(eq(messages.ministryId, ministryId));
    
    if (recipientId) {
      query = query.where(eq(messages.recipientId, recipientId));
    }
    
    return await query.orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessagesAsRead(recipientId: number, senderId: number): Promise<boolean> {
    const result = await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.recipientId, recipientId),
          eq(messages.senderId, senderId),
          eq(messages.read, false)
        )
      );
    return result.count > 0;
  }
}