import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Productos } from './components/pages/productos/productos';
import { Consolas } from './components/pages/consolas/consolas';
import { Accesorios } from './components/pages/accesorios/accesorios';
import { Juegos } from './components/pages/juegos/juegos';
import { Login } from './components/pages/login/login';
import { PageNotFound } from './components/pages/page-not-found/page-not-found';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: "home", component: Home, title: "Inicio" },
    { path: "productos", component: Productos, title: "Productos" },
    { path: "consolas", component: Consolas, title: "Consolas" },
    { path: "accesorios", component: Accesorios, title: "Accesorios" },
    { path: "juegos", component: Juegos, title: "Juegos" },
    { path: "login", component: Login, title: "Login | Empresa" },
    { path: 'redirect', redirectTo: 'home', pathMatch: 'full' },
    { path: "**", component: PageNotFound, title: "Error 404, página no encontrada" },
];
