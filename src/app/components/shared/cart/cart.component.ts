import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../../services/cart.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-overlay" [class.visible]="isVisible" (click)="closeCart()">
      <div class="cart-modal" (click)="$event.stopPropagation()">
        <div class="cart-header">
          <h2>🛒 Compras</h2>
          <button class="close-btn" (click)="closeCart()">×</button>
        </div>
        
        <div class="cart-content">
          <div *ngIf="cartItems.length === 0" class="empty-cart">
            <div class="empty-icon"><i class="bi bi-cart4"></i></div>
            <h3>Tu compra está vacía</h3>
            <p>Agrega algunos productos para comenzar a comprar</p>
          </div>
          
          <div *ngIf="cartItems.length > 0" class="cart-items">
            <div *ngFor="let item of cartItems" class="cart-item">
              <div class="item-image">
                <div class="placeholder-image">
                  <span class="placeholder-icon">🎮</span>
                </div>
              </div>
              
              <div class="item-details">
                <h4 class="item-name">{{ item.name }}</h4>
                <p class="item-brand" *ngIf="item.brand">{{ item.brand }}</p>
                <span class="item-type">{{ getTypeLabel(item.type) }}</span>
              </div>
              
              <div class="item-quantity">
                <button class="qty-btn" (click)="updateQuantity(item.id, item.quantity - 1)">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
              </div>
              
              <div class="item-price">
                <span class="price">{{ item.price * item.quantity | currency:'COP':'symbol':'1.0-0' }}</span>
                <span class="unit-price">{{ item.price | currency:'COP':'symbol':'1.0-0' }} c/u</span>
              </div>
              
              <button class="remove-btn" (click)="removeItem(item.id)">🗑️</button>
            </div>
          </div>
        </div>
        
        <div *ngIf="cartItems.length > 0" class="cart-footer">
          <div class="cart-total">
            <span class="total-label">Total:</span>
            <span class="total-amount">{{ getCartTotal() | currency:'COP':'symbol':'1.0-0' }}</span>
          </div>
          
          <div class="cart-actions">
            <button class="btn btn-secondary" (click)="clearCart()">Limpiar Compras</button>
            <button class="btn btn-primary" (click)="checkout()">Finalizar Compra</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isVisible = false;
  private cartSubscription: Subscription = new Subscription();
  private visibilitySubscription: Subscription = new Subscription();

  constructor(private cartService: CartService, private toastr: ToastrService) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });

    this.visibilitySubscription = this.cartService.getCartVisible().subscribe(visible => {
      this.isVisible = visible;
    });
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
    this.visibilitySubscription.unsubscribe();
  }

  closeCart() {
    this.cartService.hideCart();
  }

  updateQuantity(itemId: string, quantity: number) {
    this.cartService.updateQuantity(itemId, quantity);
  }

  removeItem(itemId: string) {
    this.cartService.removeFromCart(itemId);
  }

  clearCart() {
    if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
      this.cartService.clearCart();
    }
  }

  checkout() {
    try {
      const message = this.createWhatsAppMessage();
      
      const phoneNumber = '573155230570';
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      this.toastr.info('WhatsApp URL: ' + whatsappUrl);
      this.toastr.info('Message length: ' + message.length);
      
      if (message.length > 1000) {
        const simpleMessage = this.createSimpleWhatsAppMessage();
        const simpleUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(simpleMessage)}`;
        window.open(simpleUrl, '_blank');
      } else {
        const newWindow = window.open(whatsappUrl, '_blank');
        
        if (!newWindow) {
          alert('Por favor, permite popups para abrir WhatsApp automáticamente, o copia este enlace:\n\n' + whatsappUrl);
        }
      }
      
      setTimeout(() => {
        this.cartService.clearCart();
        this.closeCart();
      }, 1000);
      
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      const phoneNumber = '573155230570';
      const fallbackMessage = 'Hola, quiero hacer un pedido en Princegaming.';
      const fallbackUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fallbackMessage)}`;
      window.open(fallbackUrl, '_blank');
      
      this.cartService.clearCart();
      this.closeCart();
    }
  }

  private createWhatsAppMessage(): string {
    const total = this.getCartTotal();
    
    let message = `NUEVO PEDIDO - Princegaming\n\n`;
    message += `Productos solicitados:\n\n`;
    
    this.cartItems.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      message += `${index + 1}. ${item.name}\n`;
      message += `   Marca: ${item.brand || 'N/A'}\n`;
      message += `   Tipo: ${this.getTypeLabel(item.type)}\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: ${item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} c/u\n`;
      message += `   Subtotal: ${subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}\n\n`;
    });
    
    message += `TOTAL: ${total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}\n\n`;
    message += `Por favor, confirma mi pedido y proporciona información sobre el envío.`;
    
    return message;
  }

  private createSimpleWhatsAppMessage(): string {
    const total = this.getCartTotal();
    let message = `🛒 *PEDIDO - PRINCEGAMING*\n\n`;
    message += `📋 *Productos:*\n`;
    
    this.cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.quantity}x)\n`;
    });
    
    message += `\n💰 *Total: ${total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}*\n\n`;
    message += `Por favor, confirma mi pedido y proporciona información de envío.`;
    
    return message;
  }

  getCartTotal(): number {
    return this.cartService.getCartTotal();
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'juego': 'Juego'
    };
    return labels[type] || type;
  }
} 