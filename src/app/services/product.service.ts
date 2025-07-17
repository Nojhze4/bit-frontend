import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductModel {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  stock: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  allOK: boolean;
  message: string;
  data: T;
}

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
export class ProductService {
  private apiUrl = 'http://localhost:4000/api/products';
  private uploadUrl = 'http://localhost:4000/api/upload';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<ApiResponse<ProductModel[]>> {
    return this.http.get<ApiResponse<ProductModel[]>>(this.apiUrl);
  }

  getProductById(id: string): Observable<ApiResponse<ProductModel>> {
    return this.http.get<ApiResponse<ProductModel>>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Omit<ProductModel, '_id' | 'createdAt' | 'updatedAt'>): Observable<ApiResponse<ProductModel>> {
    return this.http.post<ApiResponse<ProductModel>>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<ProductModel>): Observable<ApiResponse<ProductModel>> {
    return this.http.put<ApiResponse<ProductModel>>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getConsoles(): Observable<ApiResponse<ProductModel[]>> {
    return this.http.get<ApiResponse<ProductModel[]>>(`${this.apiUrl}/consoles`);
  }

  getAccessories(): Observable<ApiResponse<ProductModel[]>> {
    return this.http.get<ApiResponse<ProductModel[]>>(`${this.apiUrl}/accessories`);
  }

  createConsole(console: Partial<ProductModel>): Observable<ApiResponse<ProductModel>> {
    return this.http.post<ApiResponse<ProductModel>>(`${this.apiUrl}/consoles`, console);
  }

  createAccessory(accessory: Partial<ProductModel>): Observable<ApiResponse<ProductModel>> {
    return this.http.post<ApiResponse<ProductModel>>(`${this.apiUrl}/accessories`, accessory);
  }

  // Subir imagen general
  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<UploadResponse>(`${this.uploadUrl}/image`, formData);
  }

  // Subir imagen específica para producto
  uploadProductImage(file: File, productId: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('productId', productId);
    return this.http.post<UploadResponse>(`${this.uploadUrl}/product-image`, formData);
  }
} 