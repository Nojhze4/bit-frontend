import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header';
import { Footer } from './components/shared/footer/footer';
import { CartComponent } from './components/shared/cart/cart.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, Footer, CartComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Princegaming';

  constructor(private auth: AuthService) {
    this.auth.validateToken().pipe(
      catchError(() => {
        this.auth.logout();
        return of(false);
      })
    ).subscribe(isValid => {
      if (!isValid) {
        this.auth.logout();
      }
    });
  }
}
