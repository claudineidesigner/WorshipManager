import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { isAuthenticated } from "./auth";
import { setupAuth } from "./replitAuth";
import * as z from "zod";
import { 
  insertMinistrySchema,
  insertMinistryMemberSchema,
  insertSongSchema,
  insertServiceSchema,
  insertServiceMemberSchema,
  insertServiceSongSchema,
  insertAvailabilitySchema,
  insertMessageSchema
} from "@shared/schema";
import { DatabaseStorage } from "./dbStorage";
import { db } from "./db";

// Use a classe DatabaseStorage para operações no banco de dados
const storage = new DatabaseStorage();

// Função utilitária para gerar código de ministério
function generateMinistryCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar autenticação OAuth com Replit
  await setupAuth(app);

  // Rota de usuário autenticado
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Falha ao buscar informações do usuário" });
    }
  });
  
  // Rotas de ministérios
  app.get("/api/ministries", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      if (!userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }
      
      // Temporário: apenas retornar um array vazio até implementarmos o banco de dados completo
      res.json([]);
    } catch (error) {
      console.error("Erro ao buscar ministérios:", error);
      res.status(500).json({ message: "Erro no servidor" });
    }
  });
  
  app.post("/api/ministries", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      if (!userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }
      
      const ministryData = insertMinistrySchema.parse(req.body);
      
      // Generate a code if not provided
      if (!ministryData.code) {
        ministryData.code = generateMinistryCode();
      }
      
      // Set the creator
      ministryData.createdBy = userId;
      
      // Por enquanto, apenas simulamos a criação do ministério
      // Quando implementarmos o banco de dados completamente, isso será atualizado
      const ministry = {
        id: 1,
        ...ministryData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(201).json(ministry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Erro ao criar ministério:", error);
      res.status(500).json({ message: "Erro no servidor" });
    }
  });
  
  app.get("/api/ministries/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const ministryId = parseInt(req.params.id);
      if (isNaN(ministryId)) {
        return res.status(400).json({ message: "Invalid ministry ID" });
      }
      
      const ministry = await storage.getMinistry(ministryId);
      if (!ministry) {
        return res.status(404).json({ message: "Ministry not found" });
      }
      
      res.json(ministry);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/ministries/join", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Ministry code is required" });
      }
      
      const ministry = await storage.getMinistryByCode(code);
      if (!ministry) {
        return res.status(404).json({ message: "Ministry not found with that code" });
      }
      
      // Check if user is already a member
      const members = await storage.getMinistryMembers(ministry.id);
      const isMember = members.some(member => member.userId === userId);
      
      if (isMember) {
        return res.status(400).json({ message: "You are already a member of this ministry" });
      }
      
      // Add user as a member
      const memberData = {
        ministryId: ministry.id,
        userId,
        role: "Member"
      };
      
      const member = await storage.createMinistryMember(memberData);
      
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Team member routes
  app.get("/api/team/members", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get user's ministries
      const ministries = await storage.getMinistryByUserId(userId);
      if (ministries.length === 0) {
        return res.json([]);
      }
      
      // For simplicity, use the first ministry
      const ministryId = ministries[0].id;
      
      // Get all members for this ministry
      const ministryMembers = await storage.getMinistryMembers(ministryId);
      
      // Get full user data for each member
      const teamMembers = [];
      for (const member of ministryMembers) {
        const user = await storage.getUser(member.userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          teamMembers.push({
            id: member.id,
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            profileImage: user.profileImage,
            role: member.role,
            position: member.position,
          });
        }
      }
      
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/team/members", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { firstName, lastName, email, phone, role, position, ministryId } = req.body;
      
      // First create a user account
      const username = email.split('@')[0]; // Simple username generation
      const password = Math.random().toString(36).slice(2, 10); // Random password
      
      let user;
      try {
        const userData = {
          username,
          password,
          email,
          firstName,
          lastName,
          phone,
        };
        
        user = await storage.createUser(userData);
      } catch (error) {
        // User might already exist
        user = await storage.getUserByUsername(username);
        if (!user) {
          return res.status(500).json({ message: "Failed to create or find user" });
        }
      }
      
      // Add the user to the ministry
      const memberData = {
        ministryId,
        userId: user.id,
        role,
        position
      };
      
      const member = await storage.createMinistryMember(memberData);
      
      // Return the combined data
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        ...member,
        ...userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/team/members/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const memberId = parseInt(req.params.id);
      if (isNaN(memberId)) {
        return res.status(400).json({ message: "Invalid member ID" });
      }
      
      const member = await storage.getMinistryMember(memberId);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      const user = await storage.getUser(member.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        ...member,
        ...userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/team/members/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const memberId = parseInt(req.params.id);
      if (isNaN(memberId)) {
        return res.status(400).json({ message: "Invalid member ID" });
      }
      
      const member = await storage.getMinistryMember(memberId);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      const { role, position } = req.body;
      
      // Update ministry member
      const updatedMember = await storage.updateMinistryMember(memberId, {
        role,
        position
      });
      
      // Update user
      const { firstName, lastName, email, phone } = req.body;
      const user = await storage.getUser(member.userId);
      
      // We can't update the user directly, but we're simulating it here
      
      const { password, ...userWithoutPassword } = user!;
      
      res.json({
        ...updatedMember,
        ...userWithoutPassword,
        firstName,
        lastName,
        email,
        phone
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/team/members/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const memberId = parseInt(req.params.id);
      if (isNaN(memberId)) {
        return res.status(400).json({ message: "Invalid member ID" });
      }
      
      const success = await storage.deleteMinistryMember(memberId);
      if (!success) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json({ message: "Team member removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Song routes
  app.get("/api/songs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get user's ministries
      const ministries = await storage.getMinistryByUserId(userId);
      if (ministries.length === 0) {
        return res.json([]);
      }
      
      // For simplicity, use the first ministry
      const ministryId = ministries[0].id;
      
      const songs = await storage.getSongs(ministryId);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/songs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const songData = insertSongSchema.parse(req.body);
      const song = await storage.createSong(songData);
      
      res.status(201).json(song);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/songs/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const songId = parseInt(req.params.id);
      if (isNaN(songId)) {
        return res.status(400).json({ message: "Invalid song ID" });
      }
      
      const song = await storage.getSong(songId);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      res.json(song);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/songs/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const songId = parseInt(req.params.id);
      if (isNaN(songId)) {
        return res.status(400).json({ message: "Invalid song ID" });
      }
      
      const updates = req.body;
      
      const updatedSong = await storage.updateSong(songId, updates);
      if (!updatedSong) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      res.json(updatedSong);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/songs/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const songId = parseInt(req.params.id);
      if (isNaN(songId)) {
        return res.status(400).json({ message: "Invalid song ID" });
      }
      
      const success = await storage.deleteSong(songId);
      if (!success) {
        return res.status(404).json({ message: "Song not found" });
      }
      
      res.json({ message: "Song deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Service routes
  app.get("/api/services", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get user's ministries
      const ministries = await storage.getMinistryByUserId(userId);
      if (ministries.length === 0) {
        return res.json([]);
      }
      
      // For simplicity, use the first ministry
      const ministryId = ministries[0].id;
      
      const services = await storage.getServices(ministryId);
      
      // Enhance services with members and songs
      const enhancedServices = [];
      for (const service of services) {
        const serviceMembers = await storage.getServiceMembers(service.id);
        const serviceSongs = await storage.getServiceSongs(service.id);
        
        // Get member details
        const members = [];
        for (const member of serviceMembers) {
          const user = await storage.getUser(member.userId);
          if (user) {
            const { password, ...userWithoutPassword } = user;
            members.push({
              ...member,
              ...userWithoutPassword
            });
          }
        }
        
        // Get song details
        const songs = [];
        for (const serviceSong of serviceSongs) {
          const song = await storage.getSong(serviceSong.songId);
          if (song) {
            songs.push({
              ...song,
              order: serviceSong.order,
              serviceKey: serviceSong.key
            });
          }
        }
        
        enhancedServices.push({
          ...service,
          members,
          songs
        });
      }
      
      res.json(enhancedServices);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/services/upcoming", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get user's ministries
      const ministries = await storage.getMinistryByUserId(userId);
      if (ministries.length === 0) {
        return res.json([]);
      }
      
      // For simplicity, use the first ministry
      const ministryId = ministries[0].id;
      
      const services = await storage.getUpcomingServices(ministryId);
      
      // Enhance services with members and songs
      const enhancedServices = [];
      for (const service of services) {
        const serviceMembers = await storage.getServiceMembers(service.id);
        const serviceSongs = await storage.getServiceSongs(service.id);
        
        // Get member details
        const members = [];
        for (const member of serviceMembers) {
          const user = await storage.getUser(member.userId);
          if (user) {
            const { password, ...userWithoutPassword } = user;
            members.push({
              ...member,
              ...userWithoutPassword
            });
          }
        }
        
        // Get song details
        const songs = [];
        for (const serviceSong of serviceSongs) {
          const song = await storage.getSong(serviceSong.songId);
          if (song) {
            songs.push({
              ...song,
              order: serviceSong.order,
              serviceKey: serviceSong.key
            });
          }
        }
        
        enhancedServices.push({
          ...service,
          members,
          songs
        });
      }
      
      res.json(enhancedServices);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/services", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      
      // Add members if provided
      if (req.body.memberIds && Array.isArray(req.body.memberIds)) {
        for (const memberId of req.body.memberIds) {
          const member = await storage.getMinistryMember(memberId);
          if (member) {
            await storage.createServiceMember({
              serviceId: service.id,
              userId: member.userId,
              position: member.position || "Member"
            });
          }
        }
      }
      
      // Add songs if provided
      if (req.body.songIds && Array.isArray(req.body.songIds)) {
        for (let i = 0; i < req.body.songIds.length; i++) {
          const songId = req.body.songIds[i];
          const song = await storage.getSong(songId);
          if (song) {
            await storage.createServiceSong({
              serviceId: service.id,
              songId,
              order: i + 1,
              key: song.key
            });
          }
        }
      }
      
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/services/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.id);
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Get members and songs
      const serviceMembers = await storage.getServiceMembers(service.id);
      const serviceSongs = await storage.getServiceSongs(service.id);
      
      // Get member details
      const members = [];
      for (const member of serviceMembers) {
        const user = await storage.getUser(member.userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          members.push({
            ...member,
            ...userWithoutPassword
          });
        }
      }
      
      // Get song details
      const songs = [];
      for (const serviceSong of serviceSongs) {
        const song = await storage.getSong(serviceSong.songId);
        if (song) {
          songs.push({
            ...song,
            order: serviceSong.order,
            serviceKey: serviceSong.key
          });
        }
      }
      
      res.json({
        ...service,
        members,
        songs
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/services/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.id);
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const updates = req.body;
      
      // Update basic service information
      const updatedService = await storage.updateService(serviceId, {
        name: updates.name,
        date: updates.date,
        time: updates.time,
        type: updates.type,
        notes: updates.notes,
        status: updates.status
      });
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/services/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.id);
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const success = await storage.deleteService(serviceId);
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Activities
  app.get("/api/activities", isAuthenticated, async (req: Request, res: Response) => {
    // This is a mock endpoint for activities
    res.json([
      {
        id: 1,
        description: "Sarah Johnson updated her availability for July",
        timeAgo: "1 hour ago",
        user: {
          id: 2,
          firstName: "Sarah",
          lastName: "Johnson",
          profileImage: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
        }
      },
      {
        id: 2,
        description: "David Wilson added a new song \"Build My Life\" to the library",
        timeAgo: "3 hours ago",
        user: {
          id: 1,
          firstName: "David",
          lastName: "Wilson",
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        }
      },
      {
        id: 3,
        description: "Michael Brown created a schedule for \"Midweek Service\"",
        timeAgo: "Yesterday at 2:30 PM",
        user: {
          id: 3,
          firstName: "Michael",
          lastName: "Brown",
          profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
        }
      }
    ]);
  });
  
  // Messages
  app.get("/api/messages/conversations", isAuthenticated, async (req: Request, res: Response) => {
    // Mock conversations data
    res.json([
      {
        id: 1,
        name: "Sarah Johnson",
        avatar: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
        lastMessage: "I'll be there for rehearsal tonight at 7PM",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        unreadCount: 2,
        position: "Vocalist, Piano",
        messages: [
          {
            id: 1,
            content: "Hi David, just confirming practice for tonight at 7PM. I'll be bringing my keyboard.",
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
            isCurrentUser: false,
            sender: {
              name: "Sarah",
              avatar: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
            }
          },
          {
            id: 2,
            content: "Hi Sarah, yes practice is still at 7PM. Thanks for bringing the keyboard!",
            timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
            isCurrentUser: true,
            sender: {
              name: "David",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            }
          },
          {
            id: 3,
            content: "Also, do you want me to bring the chord charts for the new song?",
            timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
            isCurrentUser: false,
            sender: {
              name: "Sarah",
              avatar: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
            }
          },
          {
            id: 4,
            content: "I'll be there for rehearsal tonight at 7PM",
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
            isCurrentUser: false,
            sender: {
              name: "Sarah",
              avatar: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
            }
          }
        ]
      },
      {
        id: 2,
        name: "Michael Brown",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
        lastMessage: "Got the new chord charts, thanks for sending them over!",
        timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
        unreadCount: 0,
        position: "Electric Guitar"
      },
      {
        id: 3,
        name: "ICB IGUA TEMI Team",
        lastMessage: "David: Don't forget to prepare the new song for Sunday",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
        unreadCount: 5,
        isGroup: true
      },
      {
        id: 4,
        name: "Emily Davis",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
        lastMessage: "Can you send me the drum parts for Great Are You Lord?",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
        unreadCount: 0,
        position: "Drums"
      }
    ]);
  });

  const httpServer = createServer(app);
  return httpServer;
}
