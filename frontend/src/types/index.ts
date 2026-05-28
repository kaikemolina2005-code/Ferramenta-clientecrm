export type UserRole = 'ADMIN' | 'LAWYER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadCategory = 'PROCESS' | 'BPC_LOAS' | 'RETIREMENT' | 'CONSULTATION';
export type LeadStatus = 'INITIAL' | 'CONSULTING' | 'PAYMENT' | 'LOSS' | 'CONVERTED';

export interface Lead {
  id: string;
  whatsappId?: string;
  name: string;
  cpf: string;
  birthDate?: Date;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  category: LeadCategory;
  status: LeadStatus;
  source?: string;
  responsibleId?: string;
  responsible?: User;
  createdAt: string;
  updatedAt: string;
}

export type KanbanSector = 'COMMERCIAL' | 'LEGAL' | 'ADMINISTRATIVE';

export interface KanbanCard {
  id: string;
  leadId: string;
  lead: Lead;
  sector: KanbanSector;
  stage: string;
  position: number;
  responsibleId?: string;
  responsible?: User;
  notes?: string;
  movedBy?: string;
  movedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  leadId?: string;
  lead?: Lead;
  uploaderId: string;
  uploader: User;
  name: string;
  type: 'RG' | 'CPF' | 'PHOTO' | 'PDF' | 'OTHER';
  fileUrl: string;
  oneDriveId?: string;
  processedBy?: string;
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  user: User;
  leadId?: string;
  lead?: Lead;
  action: string;
  details?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'new_lead' | 'document_sent' | 'stage_changed' | 'other';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
