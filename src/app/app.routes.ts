import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Juegos } from './components/pages/juegos/juegos';
import { Productos } from './components/pages/productos/productos';
import { LoginComponent } from './components/pages/login/login';
import { PageNotFound } from './components/pages/page-not-found/page-not-found';
import { Dashboard } from './components/pages/dashboard/dashboard';
import { Panel } from './services/service/panel/panel';
import { AuthGuard } from './guards/auth.guard';
import { Cart } from './components/pages/cart/cart';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: "home", component: Home, title: "Inicio" },
    { path: "productos", component: Productos, title: "Productos" },
    { path: "juegos", component: Juegos, title: "Juegos" },
    { path: "cart", component: Cart, title: "Compras" },
    { path: "login", component: LoginComponent, title: "Login | Princegaming" },
    { path: "panel", component: Dashboard, title: "Panel", canActivate: [AuthGuard] },
    { path: 'redirect', redirectTo: 'home', pathMatch: 'full' },
    { path: "**", component: PageNotFound, title: "Error 404, página no encontrada" },
];
