import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Game {
  _id: string;
  name: string;
  consola: string;
  genero: string;
  descripcion: string;
  precio: number;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  developer: string;
  publisher: string;
  releaseYear?: number;
  rating: string;
  multiplayer: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  private apiUrl = 'http://localhost:4000/games';

  constructor(private http: HttpClient) {}

  getAllGames(params?: {
    genero?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    multiplayer?: boolean;
  }): Observable<{allOK: boolean, message: string, data: Game[]}> {
    let url = this.apiUrl;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }
    return this.http.get<{allOK: boolean, message: string, data: Game[]}>(url);
  }

  getGameById(id: string): Observable<{allOK: boolean, message: string, data: Game}> {
    return this.http.get<{allOK: boolean, message: string, data: Game}>(`${this.apiUrl}/${id}`);
  }

  getGamesByGenre(genero: string): Observable<{allOK: boolean, message: string, data: Game[]}> {
    return this.http.get<{allOK: boolean, message: string, data: Game[]}>(`${this.apiUrl}/genre/${genero}`);
  }

  getMultiplayerGames(): Observable<{allOK: boolean, message: string, data: Game[]}> {
    return this.http.get<{allOK: boolean, message: string, data: Game[]}>(`${this.apiUrl}/multiplayer/available`);
  }

  getGamesInStock(): Observable<{allOK: boolean, message: string, data: Game[]}> {
    return this.http.get<{allOK: boolean, message: string, data: Game[]}>(`${this.apiUrl}/stock/available`);
  }

  getPlaystationGames(): Observable<{allOK: boolean, message: string, data: Game[]}> {
    return this.http.get<{allOK: boolean, message: string, data: Game[]}>(`${this.apiUrl}?consola=playstation`);
  }
  getXboxGames(): Observable<{allOK: boolean, message: string, data: Game[]}> {
    return this.http.get<{allOK: boolean, message: string, data: Game[]}>(`${this.apiUrl}?consola=xbox`);
  }
  getNintendoGames(): Observable<{allOK: boolean, message: string, data: Game[]}> {
    return this.http.get<{allOK: boolean, message: string, data: Game[]}>(`${this.apiUrl}?consola=nintendo`);
  }

  createGame(game: Omit<Game, '_id' | 'createdAt' | 'updatedAt'>): Observable<{allOK: boolean, message: string, data: Game}> {
    return this.http.post<{allOK: boolean, message: string, data: Game}>(this.apiUrl, game);
  }

  updateGame(id: string, game: Partial<Game>): Observable<{allOK: boolean, message: string, data: Game}> {
    return this.http.put<{allOK: boolean, message: string, data: Game}>(`${this.apiUrl}/${id}`, game);
  }

  deleteGame(id: string): Observable<{allOK: boolean, message: string, data: null}> {
    return this.http.delete<{allOK: boolean, message: string, data: null}>(`${this.apiUrl}/${id}`);
  }
} 