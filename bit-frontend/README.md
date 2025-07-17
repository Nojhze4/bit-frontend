# Bit Frontend

Este proyecto es una aplicación web desarrollada con Angular para la gestión y visualización de productos, juegos, consolas y accesorios. Está diseñado para ofrecer una experiencia de usuario moderna, intuitiva y completamente responsive. Además, utiliza Node.js y Express como tecnologías en el backend para la gestión de datos y autenticación.

## Características principales
- Visualización unificada de juegos, consolas y accesorios.
- Filtros avanzados por tipo, categoría, precio y stock.
- Panel de administración para agregar productos con formularios unificados y tabs.
- Autenticación de usuarios y protección de rutas.
- Subida de imágenes para productos.
- Diseño moderno y adaptativo para dispositivos móviles y escritorio.
- Página de error 404 personalizada.

## Estructura del proyecto
- `src/app/components/pages/` — Páginas principales (productos, dashboard, login, etc.)
- `src/app/components/shared/` — Componentes reutilizables (header, footer, carrito, etc.)
- `src/app/services/` — Servicios para autenticación, productos, carrito, etc.
- `src/app/guards/` — Guardas de rutas para autenticación.
- `src/app/interceptors/` — Interceptores para manejo de tokens y errores.

## Instalación y ejecución
1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia la aplicación en modo desarrollo:
   ```bash
   npm start
   ```
3. Accede a la app en [http://localhost:4200](http://localhost:4200)

## Notas
- Asegúrate de tener el backend configurado y corriendo para el correcto funcionamiento de la autenticación y gestión de productos.
- El proyecto es completamente responsive y se adapta a cualquier dispositivo.

---

Desarrollado para la gestión eficiente de productos, juegos, consolas y accesorios. 