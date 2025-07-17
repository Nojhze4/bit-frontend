import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'juego' | 'consola' | 'accesorio';
  imageUrl?: string;
  brand?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private cartVisible = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loadCartFromStorage();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartVisible(): Observable<boolean> {
    return this.cartVisible.asObservable();
  }

  getCurrentCartItems(): CartItem[] {
    return this.cartItems.value;
  }

  addToCart(item: Omit<CartItem, 'quantity'>): void {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.updateCart([...currentItems]);
    } else {
      const newItem: CartItem = { ...item, quantity: 1 };
      this.updateCart([...currentItems, newItem]);
    }
  }

  removeFromCart(itemId: string): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    this.updateCart(updatedItems);
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    this.updateCart(updatedItems);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getCartItemCount(): number {
    return this.cartItems.value.reduce((total, item) => total + item.quantity, 0);
  }

  toggleCart(): void {
    this.cartVisible.next(!this.cartVisible.value);
  }

  showCart(): void {
    this.cartVisible.next(true);
  }

  hideCart(): void {
    this.cartVisible.next(false);
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        this.cartItems.next(cartItems);
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        this.cartItems.next([]);
      }
    }
  }

  private updateCart(items: CartItem[]): void {
    this.cartItems.next(items);
    this.saveCartToStorage();
  }
} 