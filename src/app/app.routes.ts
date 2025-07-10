import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Consolas } from './components/pages/consolas/consolas';
import { Accesorios } from './components/pages/accesorios/accesorios';
import { Juegos } from './components/pages/juegos/juegos';
import { LoginComponent } from './components/pages/login/login';
import { PageNotFound } from './components/pages/page-not-found/page-not-found';
import { Panel } from './services/service/panel/panel';
import { AuthGuard } from './guards/auth.guard';
import { Cart } from './components/pages/cart/cart';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: "home", component: Home, title: "Inicio" },
    { path: "consolas", component: Consolas, title: "Consolas" },
    { path: "accesorios", component: Accesorios, title: "Accesorios" },
    { path: "juegos", component: Juegos, title: "Juegos" },
    { path: "cart", component: Cart, title: "Carro de Compras" },
    { path: "login", component: LoginComponent, title: "Login | Princegaming" },
    { path: "panel", component: Panel, title: "Panel", canActivate: [AuthGuard] },
    { path: 'redirect', redirectTo: 'home', pathMatch: 'full' },
    { path: "**", component: PageNotFound, title: "Error 404, página no encontrada" },
];
