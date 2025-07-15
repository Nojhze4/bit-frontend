import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount = 0;
  private cartSubscription: Subscription = new Subscription();

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });
  }

  ngOnDestroy() {
    this.cartSubscription.unsubscribe();
  }

  openCart() {
    this.cartService.showCart();
  }
}
