import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server } from 'http';
import {
  SocketEvents,
  DocumentAnalyzedEvent,
  DocumentProcessingStartedEvent,
  DocumentProcessingCompletedEvent,
  KanbanCardMovedEvent,
  KanbanCardCreatedEvent,
  KanbanCardDeletedEvent,
  LeadStatusChangedEvent,
  LeadConvertedEvent,
  ActivityLogEvent,
  Notification,
} from './events';

/**
 * Socket.io Service
 * Gerencia conexões em tempo real e emissão de eventos
 */
export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Initialize Socket.io server
   */
  initialize(httpServer: Server): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupConnectionHandlers();

    console.log('✅ Socket.io initialized');
    return this.io;
  }

  /**
   * Setup connection handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on('connect', (socket: Socket) => {
      console.log(`🟢 Client connected: ${socket.id}`);

      socket.on('user:authenticate', (userId: string) => {
        this.registerUser(userId, socket.id);
        console.log(`👤 User authenticated: ${userId} (socket: ${socket.id})`);

        // Emit list of online users
        this.broadcastOnlineUsers();
      });

      socket.on('disconnect', () => {
        console.log(`🔴 Client disconnected: ${socket.id}`);
        this.unregisterSocket(socket.id);
        this.broadcastOnlineUsers();
      });
    });
  }

  /**
   * Register user socket connection
   */
  private registerUser(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  /**
   * Unregister socket from all users
   */
  private unregisterSocket(socketId: string): void {
    for (const [userId, socketIds] of this.userSockets.entries()) {
      if (socketIds.has(socketId)) {
        socketIds.delete(socketId);
        if (socketIds.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  /**
   * Broadcast list of online users
   */
  private broadcastOnlineUsers(): void {
    if (!this.io) return;

    const onlineUsers = Array.from(this.userSockets.keys());
    this.io.emit(SocketEvents.USERS_ONLINE, { users: onlineUsers, count: onlineUsers.length });
  }

  /**
   * Emit document analyzed event
   */
  emitDocumentAnalyzed(event: DocumentAnalyzedEvent): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.DOCUMENT_ANALYZED, event);
  }

  /**
   * Emit document processing started
   */
  emitDocumentProcessingStarted(event: DocumentProcessingStartedEvent): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.DOCUMENT_PROCESSING_STARTED, event);
  }

  /**
   * Emit document processing completed
   */
  emitDocumentProcessingCompleted(event: DocumentProcessingCompletedEvent): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.DOCUMENT_PROCESSING_COMPLETED, event);
  }

  /**
   * Emit document processing error
   */
  emitDocumentProcessingError(leadId: string, error: string, userId: string): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.DOCUMENT_PROCESSING_ERROR, {
      leadId,
      error,
      userId,
      timestamp: new Date(),
    });
  }

  /**
   * Emit kanban card moved
   */
  emitKanbanCardMoved(event: KanbanCardMovedEvent): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.KANBAN_CARD_MOVED, event);
  }

  /**
   * Emit kanban card created
   */
  emitKanbanCardCreated(event: KanbanCardCreatedEvent): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.KANBAN_CARD_CREATED, event);
  }

  /**
   * Emit kanban card deleted
   */
  emitKanbanCardDeleted(event: KanbanCardDeletedEvent): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.KANBAN_CARD_DELETED, event);
  }

  /**
   * Emit lead status changed
   */
  emitLeadStatusChanged(event: LeadStatusChangedEvent): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.LEAD_STATUS_CHANGED, event);
  }

  /**
   * Emit lead converted
   */
  emitLeadConverted(event: LeadConvertedEvent): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.LEAD_CONVERTED, event);
  }

  /**
   * Emit lead created
   */
  emitLeadCreated(event: any): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.LEAD_CREATED, event);
  }

  /**
   * Emit activity log
   */
  emitActivityLog(event: ActivityLogEvent): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.ACTIVITY_LOG, event);
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: string, notification: Notification): void {
    if (!this.io) return;

    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      for (const socketId of socketIds) {
        this.io.to(socketId).emit(SocketEvents.NOTIFICATION_SENT, notification);
      }
    }
  }

  /**
   * Broadcast notification to all users
   */
  broadcastNotification(notification: Notification): void {
    if (!this.io) return;
    this.io.emit(SocketEvents.NOTIFICATION_SENT, notification);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: Notification): void {
    for (const userId of userIds) {
      this.sendNotificationToUser(userId, notification);
    }
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get Socket.io instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Export singleton instance
export const socketService = SocketService.getInstance();
