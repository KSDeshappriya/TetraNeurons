import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export type UserRole = 'first_responder' | 'volunteer' | 'user' | 'government';

export interface UserSignup {
  name: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  profile_image_url?: string;
  password: string;
  role: UserRole;
  skills?: string[];
  department?: string;
  unit?: string;
  position?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  profile_image_url: string | null;
  role: 'user' | 'volunteer' | 'first_responder' | 'government';
  created_at: string;
  skills?: string[];
  department?: string;
  unit?: string;
  position?: string;
  status?: 'normal' | 'emergency';
}

export interface UserLogin {
  email: string;
  password: string;
  latitude: number;
  longitude: number;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_info: unknown;
}

export interface TokenPayload {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  exp: number;
}

class AuthService {
  private token: string | null = null;
  private tokenPayload: TokenPayload | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
    if (this.token) {
      this.loadTokenPayload();
    }
    this.setupAxiosInterceptors();
  }

  private parseJwt(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private loadTokenPayload() {
    if (this.token) {
      this.tokenPayload = this.parseJwt(this.token);
      if (this.tokenPayload && this.tokenPayload.exp * 1000 < Date.now()) {
        this.logout();
      }
    }
  }

  private setupAxiosInterceptors() {
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token && !config.url?.includes('/auth/') && !config.url?.includes('/public/')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/auth/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  async signup(userData: UserSignup) {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
    return response.data;
  }

  async login(loginData: UserLogin): Promise<Token> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    const token = response.data;
    localStorage.setItem('access_token', token.access_token);
    this.token = token.access_token;
    this.loadTokenPayload();
    return token;
  }

  async getUserProfile(): Promise<UserProfile> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/private/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  logout() {
    localStorage.removeItem('access_token');
    this.token = null;
    this.tokenPayload = null;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.tokenPayload && this.tokenPayload.exp * 1000 > Date.now();
  }

  getUserRole(): UserRole | null {
    return this.tokenPayload?.role || null;
  }

  getTokenPayload(): TokenPayload | null {
    return this.tokenPayload;
  }

  hasRole(role: UserRole): boolean {
    return this.getUserRole() === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }
}

export const authService = new AuthService();