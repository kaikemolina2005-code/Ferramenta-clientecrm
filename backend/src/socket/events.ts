/**
 * Socket.io Event Types and Interfaces
 */

// ==================== Document Events ====================
export interface DocumentAnalyzedEvent {
  documentId: string;
  leadId: string;
  documentType: string;
  classification: string;
  confidence: number;
  summary: string;
  timestamp: Date;
  userId: string;
}

export interface DocumentProcessingStartedEvent {
  leadId: string;
  totalDocuments: number;
  timestamp: Date;
  userId: string;
}

export interface DocumentProcessingCompletedEvent {
  leadId: string;
  processedCount: number;
  successCount: number;
  failureCount: number;
  timestamp: Date;
  userId: string;
}

// ==================== Kanban Events ====================
export interface KanbanCardMovedEvent {
  cardId: string;
  leadId: string;
  fromSector: 'COMMERCIAL' | 'LEGAL' | 'ADMINISTRATIVE';
  toSector: 'COMMERCIAL' | 'LEGAL' | 'ADMINISTRATIVE';
  fromPosition: number;
  toPosition: number;
  timestamp: Date;
  userId: string;
  userName: string;
}

export interface KanbanCardCreatedEvent {
  cardId: string;
  leadId: string;
  sector: 'COMMERCIAL' | 'LEGAL' | 'ADMINISTRATIVE';
  title: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

export interface KanbanCardDeletedEvent {
  cardId: string;
  leadId: string;
  sector: 'COMMERCIAL' | 'LEGAL' | 'ADMINISTRATIVE';
  timestamp: Date;
  userId: string;
  userName: string;
}

// ==================== Lead Events ====================
export interface LeadStatusChangedEvent {
  leadId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

export interface LeadConvertedEvent {
  leadId: string;
  leadName: string;
  conversionValue: number;
  timestamp: Date;
  userId: string;
  userName: string;
}

export interface LeadCreatedEvent {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  status: string;
  source: string;
  createdAt: Date;
}

// ==================== Activity Events ====================
export interface ActivityLogEvent {
  userId: string;
  userName: string;
  action: string;
  leadId?: string;
  details: Record<string, any>;
  timestamp: Date;
}

// ==================== Notification ====================
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  leadId?: string;
  documentId?: string;
}

// ==================== Socket Events Map ====================
export const SocketEvents = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Document Processing
  DOCUMENT_PROCESSING_STARTED: 'document:processing:started',
  DOCUMENT_ANALYZED: 'document:analyzed',
  DOCUMENT_PROCESSING_COMPLETED: 'document:processing:completed',
  DOCUMENT_PROCESSING_ERROR: 'document:processing:error',
  
  // Kanban
  KANBAN_CARD_MOVED: 'kanban:card:moved',
  KANBAN_CARD_CREATED: 'kanban:card:created',
  KANBAN_CARD_DELETED: 'kanban:card:deleted',
  KANBAN_CARD_UPDATED: 'kanban:card:updated',
  
  // Leads
  LEAD_STATUS_CHANGED: 'lead:status:changed',
  LEAD_CONVERTED: 'lead:converted',
  LEAD_CREATED: 'lead:created',
  
  // Activity
  ACTIVITY_LOG: 'activity:log',
  
  // Notifications
  NOTIFICATION_SENT: 'notification:sent',
  NOTIFICATIONS_READ: 'notifications:read',
  
  // User presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USERS_ONLINE: 'users:online',
} as const;

export type SocketEventType = typeof SocketEvents[keyof typeof SocketEvents];
