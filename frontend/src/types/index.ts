export enum Role {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN'
}

export enum ComplaintType {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  HEALTHCARE = 'HEALTHCARE',
  SANITATION = 'SANITATION',
  SAFETY = 'SAFETY',
  TRANSPORTATION = 'TRANSPORTATION',
  EDUCATION = 'EDUCATION',
  ENVIRONMENT = 'ENVIRONMENT',
  UTILITIES = 'UTILITIES',
  OTHER = 'OTHER'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  type: ComplaintType;
  status: ComplaintStatus;
  user: User;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  adminNotes?: string;
  images?: ComplaintImage[];
  updates?: ComplaintUpdate[];
}

export interface ComplaintImage {
  id: number;
  imageUrl: string;
  imageName?: string;
  fileSize?: number;
  createdAt: string;
}

export interface ComplaintUpdate {
  id: number;
  message: string;
  previousStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  updatedBy?: User;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role?: Role;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintRequest {
  title: string;
  description: string;
  type: ComplaintType;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  imageUrls?: string[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
