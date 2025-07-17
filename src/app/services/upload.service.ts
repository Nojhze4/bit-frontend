import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadResponse {
  allOK: boolean;
  message: string;
  data: {
    imageUrl: string;
    filename: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    // Recupera el token del localStorage (o donde lo guardes)
    const token = localStorage.getItem('authToken');

    return this.http.post<UploadResponse>(`${this.apiUrl}/image`, formData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  uploadGameImage(file: File, gameId: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('gameId', gameId);

    // Recupera el token del localStorage (o donde lo guardes)
    const token = localStorage.getItem('authToken');

    return this.http.post<UploadResponse>(`${this.apiUrl}/game-image`, formData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }
} 