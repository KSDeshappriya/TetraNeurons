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
  private readonly tokenKey = 'access_token'; // Consistent token key

  constructor() {
    this.token = localStorage.getItem(this.tokenKey);
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
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  private loadTokenPayload() {
    if (this.token) {
      this.tokenPayload = this.parseJwt(this.token);
      // Check if token is expired
      if (this.tokenPayload && this.tokenPayload.exp * 1000 < Date.now()) {
        console.log('Token expired, logging out');
        this.logout();
      }
    }
  }

  private setupAxiosInterceptors() {
    // Request interceptor
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem(this.tokenKey);
      if (token && !config.url?.includes('/auth/') && !config.url?.includes('/public/')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('401 Unauthorized, logging out');
          this.logout();
          window.location.href = '/auth/signin';
        }
        return Promise.reject(error);
      }
    );
  }

  // Public methods
  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.token = token;
    this.loadTokenPayload();
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.token = null;
    this.tokenPayload = null;
  }

  getTokenPayload(): TokenPayload | null {
    return this.tokenPayload;
  }

  async signup(userData: UserSignup) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async login(loginData: UserLogin): Promise<Token> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      const token = response.data;
      
      // Store token using consistent method
      this.setToken(token.access_token);
      
      return token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const token = this.getToken(); // Use consistent token retrieval
      if (!token) {
        throw new Error('No token available');
      }

      const response = await axios.get(`${API_BASE_URL}/private/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  logout() {
    this.removeToken();
    // Optional: Clear any other user-related data
    // Redirect will be handled by axios interceptor or calling component
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.token;
    const hasValidPayload = !!this.tokenPayload;
    const isNotExpired = this.tokenPayload ? this.tokenPayload.exp * 1000 > Date.now() : false;
    
    const isAuth = hasToken && hasValidPayload && isNotExpired;
    
    if (!isAuth && hasToken) {
      // Clean up invalid token
      this.logout();
    }
    
    return isAuth;
  }

  getUserRole(): UserRole | null {
    return this.tokenPayload?.role || null;
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