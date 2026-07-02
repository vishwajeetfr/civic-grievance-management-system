import axios, { AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  SignupRequest, 
  JwtResponse, 
  User, 
  Complaint, 
  ComplaintRequest,
  PaginatedResponse,
  ApiResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AxiosResponse<JwtResponse>> =>
    api.post('/auth/signin', data),
  
  signup: (data: SignupRequest): Promise<AxiosResponse<ApiResponse<string>>> =>
    api.post('/auth/signup', data),
  
  getCurrentUser: (): Promise<AxiosResponse<User>> =>
    api.get('/auth/me'),
};

// Complaint API
export const complaintAPI = {
  createComplaint: (data: ComplaintRequest): Promise<AxiosResponse<ApiResponse<{ complaintId: number }>>> =>
    api.post('/citizen/complaints', data),
  
  getMyComplaints: (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Promise<AxiosResponse<PaginatedResponse<Complaint>>> =>
    api.get(`/citizen/complaints?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  
  getComplaintById: (id: number): Promise<AxiosResponse<Complaint>> =>
    api.get(`/citizen/complaints/${id}`),
  
  getAllComplaints: (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc', status?: string, type?: string, city?: string): Promise<AxiosResponse<PaginatedResponse<Complaint>>> => {
    let url = `/admin/complaints?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (status) url += `&status=${status}`;
    if (type) url += `&type=${type}`;
    if (city) url += `&city=${city}`;
    return api.get(url);
  },
  
  updateComplaintStatus: (id: number, status: string, adminNotes?: string): Promise<AxiosResponse<ApiResponse<{ complaintId: number; newStatus: string }>>> =>
    api.put(`/admin/complaints/${id}/status?status=${status}${adminNotes ? `&adminNotes=${encodeURIComponent(adminNotes)}` : ''}`),
  
  getComplaintsForHeatmap: (): Promise<AxiosResponse<Complaint[]>> =>
    api.get('/public/complaints/heatmap'),
  
  getComplaintStats: (): Promise<AxiosResponse<{ totalComplaints: number; pendingComplaints: number; inProgressComplaints: number; resolvedComplaints: number }>> =>
    api.get('/public/complaints/stats'),
  
  getComplaintTypes: (): Promise<AxiosResponse<string[]>> =>
    api.get('/public/complaints/types'),
};

export default api;
