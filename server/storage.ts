import {
  users,
  type User,
  type InsertUser,
  ministries,
  type Ministry,
  type InsertMinistry,
  ministryMembers,
  type MinistryMember,
  type InsertMinistryMember,
  songs,
  type Song,
  type InsertSong,
  services,
  type Service,
  type InsertService,
  serviceMembers,
  type ServiceMember,
  type InsertServiceMember,
  serviceSongs,
  type ServiceSong,
  type InsertServiceSong,
  availability,
  type Availability,
  type InsertAvailability,
  messages,
  type Message,
  type InsertMessage
} from "@shared/schema";
import * as bcrypt from "bcrypt";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ministry operations
  getMinistry(id: number): Promise<Ministry | undefined>;
  getMinistryByCode(code: string): Promise<Ministry | undefined>;
  getMinistries(): Promise<Ministry[]>;
  getMinistryByUserId(userId: number): Promise<Ministry[]>;
  createMinistry(ministry: InsertMinistry): Promise<Ministry>;
  
  // Ministry Member operations
  getMinistryMember(id: number): Promise<MinistryMember | undefined>;
  getMinistryMembers(ministryId: number): Promise<MinistryMember[]>;
  getMinistryMembersByUserId(userId: number): Promise<MinistryMember[]>;
  createMinistryMember(ministryMember: InsertMinistryMember): Promise<MinistryMember>;
  updateMinistryMember(id: number, ministryMember: Partial<MinistryMember>): Promise<MinistryMember | undefined>;
  deleteMinistryMember(id: number): Promise<boolean>;
  
  // Song operations
  getSong(id: number): Promise<Song | undefined>;
  getSongs(ministryId: number): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: number, song: Partial<Song>): Promise<Song | undefined>;
  deleteSong(id: number): Promise<boolean>;
  
  // Service operations
  getService(id: number): Promise<Service | undefined>;
  getServices(ministryId: number): Promise<Service[]>;
  getUpcomingServices(ministryId: number): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Service Member operations
  getServiceMember(id: number): Promise<ServiceMember | undefined>;
  getServiceMembers(serviceId: number): Promise<ServiceMember[]>;
  createServiceMember(serviceMember: InsertServiceMember): Promise<ServiceMember>;
  deleteServiceMember(id: number): Promise<boolean>;
  
  // Service Song operations
  getServiceSong(id: number): Promise<ServiceSong | undefined>;
  getServiceSongs(serviceId: number): Promise<ServiceSong[]>;
  createServiceSong(serviceSong: InsertServiceSong): Promise<ServiceSong>;
  updateServiceSongOrder(id: number, order: number): Promise<ServiceSong | undefined>;
  deleteServiceSong(id: number): Promise<boolean>;
  
  // Availability operations
  getAvailability(id: number): Promise<Availability | undefined>;
  getUserAvailability(userId: number, ministryId: number): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  deleteAvailability(id: number): Promise<boolean>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessages(ministryId: number, recipientId?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(recipientId: number, senderId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ministries: Map<number, Ministry>;
  private ministryMembers: Map<number, MinistryMember>;
  private songs: Map<number, Song>;
  private services: Map<number, Service>;
  private serviceMembers: Map<number, ServiceMember>;
  private serviceSongs: Map<number, ServiceSong>;
  private availabilities: Map<number, Availability>;
  private messages: Map<number, Message>;
  
  private userCurrentId: number;
  private ministryCurrentId: number;
  private ministryMemberCurrentId: number;
  private songCurrentId: number;
  private serviceCurrentId: number;
  private serviceMemberCurrentId: number;
  private serviceSongCurrentId: number;
  private availabilityCurrentId: number;
  private messageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.ministries = new Map();
    this.ministryMembers = new Map();
    this.songs = new Map();
    this.services = new Map();
    this.serviceMembers = new Map();
    this.serviceSongs = new Map();
    this.availabilities = new Map();
    this.messages = new Map();
    
    this.userCurrentId = 1;
    this.ministryCurrentId = 1;
    this.ministryMemberCurrentId = 1;
    this.songCurrentId = 1;
    this.serviceCurrentId = 1;
    this.serviceMemberCurrentId = 1;
    this.serviceSongCurrentId = 1;
    this.availabilityCurrentId = 1;
    this.messageCurrentId = 1;
    
    // Create some initial data
    this.seedData();
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async seedData() {
    // Create an admin user
    const adminUser = await this.createUser({
      username: "admin",
      password: "password",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    });

    // Create a ministry
    const ministry = await this.createMinistry({
      name: "ICB IGUA TEMI",
      code: "ICBTEM",
      createdBy: adminUser.id
    });

    // Add the admin as a leader of the ministry
    await this.createMinistryMember({
      ministryId: ministry.id,
      userId: adminUser.id,
      role: "Leader",
      position: "Worship Leader"
    });

    // Create some songs
    await this.createSong({
      ministryId: ministry.id,
      title: "Great Are You Lord",
      artist: "All Sons & Daughters",
      key: "D",
      bpm: 88,
      duration: "4:45",
      category: "Worship",
      chordLink: "https://example.com/chords/great-are-you-lord",
      lyricsLink: "https://example.com/lyrics/great-are-you-lord",
      audioLink: "https://example.com/audio/great-are-you-lord",
      videoLink: "https://example.com/video/great-are-you-lord"
    });

    await this.createSong({
      ministryId: ministry.id,
      title: "What A Beautiful Name",
      artist: "Hillsong Worship",
      key: "D",
      bpm: 74,
      duration: "5:30",
      category: "Worship",
      chordLink: "https://example.com/chords/what-a-beautiful-name",
      lyricsLink: "https://example.com/lyrics/what-a-beautiful-name",
      audioLink: "https://example.com/audio/what-a-beautiful-name",
      videoLink: "https://example.com/video/what-a-beautiful-name"
    });

    await this.createSong({
      ministryId: ministry.id,
      title: "Way Maker",
      artist: "Sinach",
      key: "E",
      bpm: 68,
      duration: "6:15",
      category: "Praise",
      chordLink: "https://example.com/chords/way-maker",
      lyricsLink: "https://example.com/lyrics/way-maker",
      audioLink: "https://example.com/audio/way-maker",
      videoLink: "https://example.com/video/way-maker"
    });

    // Create a service
    const service = await this.createService({
      ministryId: ministry.id,
      name: "Sunday Celebration Service",
      date: new Date().toISOString().split('T')[0],
      time: "10:00",
      type: "Sunday Service",
      notes: "Main service of the week",
      status: "pending"
    });

    // Add songs to the service
    await this.createServiceSong({
      serviceId: service.id,
      songId: 1,
      order: 1,
      key: "D"
    });

    await this.createServiceSong({
      serviceId: service.id,
      songId: 2,
      order: 2,
      key: "D"
    });

    await this.createServiceSong({
      serviceId: service.id,
      songId: 3,
      order: 3,
      key: "E"
    });

    // Add the admin as a service member
    await this.createServiceMember({
      serviceId: service.id,
      userId: adminUser.id,
      position: "Worship Leader"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const hashedPassword = await this.hashPassword(insertUser.password);
    const user: User = { ...insertUser, id, password: hashedPassword };
    this.users.set(id, user);
    return user;
  }

  // Ministry operations
  async getMinistry(id: number): Promise<Ministry | undefined> {
    return this.ministries.get(id);
  }

  async getMinistryByCode(code: string): Promise<Ministry | undefined> {
    return Array.from(this.ministries.values()).find(
      (ministry) => ministry.code === code,
    );
  }

  async getMinistries(): Promise<Ministry[]> {
    return Array.from(this.ministries.values());
  }

  async getMinistryByUserId(userId: number): Promise<Ministry[]> {
    // Get all ministry members for this user
    const userMinistryMembers = Array.from(this.ministryMembers.values()).filter(
      (member) => member.userId === userId,
    );
    
    // Get the ministries for these memberships
    const ministries: Ministry[] = [];
    for (const member of userMinistryMembers) {
      const ministry = this.ministries.get(member.ministryId);
      if (ministry) {
        ministries.push(ministry);
      }
    }
    
    return ministries;
  }

  async createMinistry(insertMinistry: InsertMinistry): Promise<Ministry> {
    const id = this.ministryCurrentId++;
    const ministry: Ministry = { ...insertMinistry, id };
    this.ministries.set(id, ministry);
    return ministry;
  }

  // Ministry Member operations
  async getMinistryMember(id: number): Promise<MinistryMember | undefined> {
    return this.ministryMembers.get(id);
  }

  async getMinistryMembers(ministryId: number): Promise<MinistryMember[]> {
    return Array.from(this.ministryMembers.values()).filter(
      (member) => member.ministryId === ministryId,
    );
  }

  async getMinistryMembersByUserId(userId: number): Promise<MinistryMember[]> {
    return Array.from(this.ministryMembers.values()).filter(
      (member) => member.userId === userId,
    );
  }

  async createMinistryMember(insertMinistryMember: InsertMinistryMember): Promise<MinistryMember> {
    const id = this.ministryMemberCurrentId++;
    const ministryMember: MinistryMember = { ...insertMinistryMember, id };
    this.ministryMembers.set(id, ministryMember);
    return ministryMember;
  }

  async updateMinistryMember(id: number, updates: Partial<MinistryMember>): Promise<MinistryMember | undefined> {
    const ministryMember = this.ministryMembers.get(id);
    if (!ministryMember) return undefined;
    
    const updatedMember = { ...ministryMember, ...updates };
    this.ministryMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteMinistryMember(id: number): Promise<boolean> {
    return this.ministryMembers.delete(id);
  }

  // Song operations
  async getSong(id: number): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async getSongs(ministryId: number): Promise<Song[]> {
    return Array.from(this.songs.values()).filter(
      (song) => song.ministryId === ministryId,
    );
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const id = this.songCurrentId++;
    const song: Song = { ...insertSong, id };
    this.songs.set(id, song);
    return song;
  }

  async updateSong(id: number, updates: Partial<Song>): Promise<Song | undefined> {
    const song = this.songs.get(id);
    if (!song) return undefined;
    
    const updatedSong = { ...song, ...updates };
    this.songs.set(id, updatedSong);
    return updatedSong;
  }

  async deleteSong(id: number): Promise<boolean> {
    return this.songs.delete(id);
  }

  // Service operations
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServices(ministryId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.ministryId === ministryId,
    );
  }

  async getUpcomingServices(ministryId: number): Promise<Service[]> {
    const today = new Date().toISOString().split('T')[0];
    return Array.from(this.services.values())
      .filter((service) => service.ministryId === ministryId && service.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceCurrentId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, updates: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updates };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }

  // Service Member operations
  async getServiceMember(id: number): Promise<ServiceMember | undefined> {
    return this.serviceMembers.get(id);
  }

  async getServiceMembers(serviceId: number): Promise<ServiceMember[]> {
    return Array.from(this.serviceMembers.values()).filter(
      (member) => member.serviceId === serviceId,
    );
  }

  async createServiceMember(insertServiceMember: InsertServiceMember): Promise<ServiceMember> {
    const id = this.serviceMemberCurrentId++;
    const serviceMember: ServiceMember = { ...insertServiceMember, id };
    this.serviceMembers.set(id, serviceMember);
    return serviceMember;
  }

  async deleteServiceMember(id: number): Promise<boolean> {
    return this.serviceMembers.delete(id);
  }

  // Service Song operations
  async getServiceSong(id: number): Promise<ServiceSong | undefined> {
    return this.serviceSongs.get(id);
  }

  async getServiceSongs(serviceId: number): Promise<ServiceSong[]> {
    return Array.from(this.serviceSongs.values())
      .filter((song) => song.serviceId === serviceId)
      .sort((a, b) => a.order - b.order);
  }

  async createServiceSong(insertServiceSong: InsertServiceSong): Promise<ServiceSong> {
    const id = this.serviceSongCurrentId++;
    const serviceSong: ServiceSong = { ...insertServiceSong, id };
    this.serviceSongs.set(id, serviceSong);
    return serviceSong;
  }

  async updateServiceSongOrder(id: number, order: number): Promise<ServiceSong | undefined> {
    const serviceSong = this.serviceSongs.get(id);
    if (!serviceSong) return undefined;
    
    const updatedServiceSong = { ...serviceSong, order };
    this.serviceSongs.set(id, updatedServiceSong);
    return updatedServiceSong;
  }

  async deleteServiceSong(id: number): Promise<boolean> {
    return this.serviceSongs.delete(id);
  }

  // Availability operations
  async getAvailability(id: number): Promise<Availability | undefined> {
    return this.availabilities.get(id);
  }

  async getUserAvailability(userId: number, ministryId: number): Promise<Availability[]> {
    return Array.from(this.availabilities.values()).filter(
      (avail) => avail.userId === userId && avail.ministryId === ministryId,
    );
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.availabilityCurrentId++;
    const availability: Availability = { ...insertAvailability, id };
    this.availabilities.set(id, availability);
    return availability;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    return this.availabilities.delete(id);
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessages(ministryId: number, recipientId?: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => {
        if (message.ministryId !== ministryId) return false;
        if (recipientId !== undefined) {
          return message.recipientId === recipientId || message.senderId === recipientId;
        }
        return true;
      })
      .sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aDate - bDate;
      });
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const createdAt = new Date().toISOString();
    const message: Message = { ...insertMessage, id, createdAt, read: false };
    this.messages.set(id, message);
    return message;
  }

  async markMessagesAsRead(recipientId: number, senderId: number): Promise<boolean> {
    let success = true;
    for (const [id, message] of this.messages.entries()) {
      if (message.recipientId === recipientId && message.senderId === senderId) {
        this.messages.set(id, { ...message, read: true });
      }
    }
    return success;
  }
}

export const storage = new MemStorage();
