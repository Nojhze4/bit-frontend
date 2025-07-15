import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
}

export interface Feature {
  _id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
}

export interface HeroConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroButtonRoute: string;
  heroBackgroundImage?: string;
}

export interface HomeData {
  hero: HeroConfig;
  categories: Category[];
  features: Feature[];
  featuredGames: any[];
  stats: {
    totalGames: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = 'http://localhost:4000/home';

  constructor(private http: HttpClient) {}

  getHomeData(): Observable<{allOK: boolean, message: string, data: HomeData}> {
    return this.http.get<{allOK: boolean, message: string, data: HomeData}>(this.apiUrl);
  }

  getCategories(): Observable<{allOK: boolean, message: string, data: Category[]}> {
    return this.http.get<{allOK: boolean, message: string, data: Category[]}>(`${this.apiUrl}/categories`);
  }

  getFeatures(): Observable<{allOK: boolean, message: string, data: Feature[]}> {
    return this.http.get<{allOK: boolean, message: string, data: Feature[]}>(`${this.apiUrl}/features`);
  }

  getFeaturedGames(limit: number = 6): Observable<{allOK: boolean, message: string, data: any[]}> {
    return this.http.get<{allOK: boolean, message: string, data: any[]}>(`${this.apiUrl}/featured-games?limit=${limit}`);
  }

  createCategory(category: Omit<Category, '_id'>): Observable<{allOK: boolean, message: string, data: Category}> {
    return this.http.post<{allOK: boolean, message: string, data: Category}>(`${this.apiUrl}/categories`, category);
  }

  createFeature(feature: Omit<Feature, '_id'>): Observable<{allOK: boolean, message: string, data: Feature}> {
    return this.http.post<{allOK: boolean, message: string, data: Feature}>(`${this.apiUrl}/features`, feature);
  }

  updateHero(heroConfig: Partial<HeroConfig>): Observable<{allOK: boolean, message: string, data: any}> {
    return this.http.put<{allOK: boolean, message: string, data: any}>(`${this.apiUrl}/hero`, heroConfig);
  }
} 