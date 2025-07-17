import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CurrencyPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';
import { GamesService, Game } from '../../../services/games.service';
import { ProductService, ProductModel } from '../../../services/product.service';

interface Product {
  id: string;
  name: string;
  type: 'juego' | 'consola' | 'accesorio';
  price: number;
  description: string;
  imageUrl?: string;
  stock: number;
  brand?: string;
  category?: string;
}

@Component({
  selector: 'app-productos',
  imports: [RouterModule, CurrencyPipe, NgIf, NgFor, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css']
})
export class Productos implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  error: string | null = null;
  
  playstationGames: Game[] = [];
  xboxGames: Game[] = [];
  nintendoGames: Game[] = [];
  allGames: Game[] = [];
  
  allProducts: ProductModel[] = [];
  
  selectedCategory: string = '';
  selectedType: string = '';
  selectedPriceRange: string = '';
  showOnlyInStock: boolean = false;
  
  activeTab: 'todos' | 'playstation' | 'xbox' | 'nintendo' = 'todos';
  activeSection: 'juegos' | 'consolas' | 'accesorios' = 'juegos';
  
  expandedProductId: string | null = null;
  
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;
  paginatedProducts: Product[] = [];
  
  Math = Math;
  
  categories = ['Acción', 'Aventura', 'RPG', 'Deportes', 'Estrategia', 'Simulación', 'Consolas', 'Accesorios'];
  types = ['juego', 'consola', 'accesorio'];
  priceRanges = [
    { label: 'Todos los precios', min: 0, max: 999999999 },
    { label: 'Menos de $200.000', min: 0, max: 200000 },
    { label: '$200.000 - $500.000', min: 200000, max: 500000 },
    { label: '$500.000 - $1.000.000', min: 500000, max: 1000000 },
    { label: 'Más de $1.000.000', min: 1000000, max: 999999999 }
  ];

  constructor(
    private cartService: CartService,
    private gamesService: GamesService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.error = null;

    // Cargar juegos
    this.gamesService.getAllGames().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.allGames = response.data;
          this.convertGamesToProducts();
        } else {
          this.error = response.message || 'Error al cargar los juegos';
        }
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.error = 'Error al conectar con el servidor';
      }
    });

    // Cargar productos
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.allProducts = response.data;
          this.convertProductsToProducts();
        } else {
          console.error('Error loading products:', response.message);
        }
        this.isLoading = false;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
        this.applyFilters();
      }
    });

    this.loadGamesByConsole();
  }

  loadGamesByConsole() {
    this.gamesService.getPlaystationGames().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.playstationGames = response.data;
        }
      },
      error: (err) => console.error('Error loading PlayStation games:', err)
    });

    this.gamesService.getXboxGames().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.xboxGames = response.data;
        }
      },
      error: (err) => console.error('Error loading Xbox games:', err)
    });

    this.gamesService.getNintendoGames().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.nintendoGames = response.data;
        }
      },
      error: (err) => console.error('Error loading Nintendo games:', err)
    });
  }

  convertGamesToProducts() {
    this.products = this.allGames.map(game => ({
      id: game._id,
      name: game.name,
      type: 'juego' as const,
      price: game.precio,
      description: game.descripcion,
      imageUrl: game.imageUrl,
      stock: game.stock,
      brand: game.developer,
      category: game.genero
    }));
  }

  convertProductsToProducts() {
    const productProducts = this.allProducts.map(product => {
      const type = this.getProductType(product.category || (product as any).brand || '');
      console.log('Producto:', product, 'Tipo detectado:', type);
      return {
        id: product._id,
        name: product.name,
        type: type as 'consola' | 'accesorio',
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        stock: product.stock,
        brand: product.category || (product as any).brand,
        category: product.category || (product as any).brand
      };
    });
    this.products = [...this.products, ...productProducts];
  }

  getProductType(category: string): string {
    if (!category) return 'accesorio';
    const cat = category.toLowerCase();
    if (cat.includes('playstation') || cat.includes('xbox') || cat.includes('nintendo') || cat.includes('consola') || cat.includes('consolas') || cat.includes('console')) return 'consola';
    if (cat.includes('accesorio') || cat.includes('accesorios') || cat.includes('accessory')) return 'accesorio';
    if (cat.includes('juego') || cat.includes('juegos') || cat.includes('game')) return 'juego';
    return 'accesorio'; // Por defecto
  }

  getCurrentGames(): Game[] {
    switch (this.activeTab) {
      case 'playstation':
        return this.playstationGames;
      case 'xbox':
        return this.xboxGames;
      case 'nintendo':
        return this.nintendoGames;
      default:
        return this.allGames;
    }
  }

  getConsoleIcon(console: string): string {
    switch (console) {
      case 'playstation':
        return '🎮';
      case 'xbox':
        return '🎮';
      case 'nintendo':
        return '🎮';
      default:
        return '🎯';
    }
  }

  getConsoleName(console: string): string {
    switch (console) {
      case 'playstation':
        return 'PlayStation';
      case 'xbox':
        return 'Xbox';
      case 'nintendo':
        return 'Nintendo';
      default:
        return 'Todos';
    }
  }

  getConsoleColor(console: string): string {
    switch (console) {
      case 'playstation':
        return '#006FCD';
      case 'xbox':
        return '#107C10';
      case 'nintendo':
        return '#E60012';
      default:
        return '#6c757d';
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.currentPage = Math.max(1, this.currentPage);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      const productsSection = document.querySelector('.products-grid');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  filterByCategory(category: string) {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    this.applyFilters();
  }

  filterByType(type: string) {
    this.selectedType = this.selectedType === type ? '' : type;
    this.applyFilters();
  }

  filterByPriceRange() {
    this.applyFilters();
  }

  toggleInStock() {
    this.showOnlyInStock = !this.showOnlyInStock;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      if (this.selectedCategory && product.category !== this.selectedCategory) return false;
      if (this.selectedType && product.type !== this.selectedType) return false;
      if (this.showOnlyInStock && product.stock === 0) return false;
      const selectedRange = this.priceRanges.find(range => range.label === this.selectedPriceRange);
      if (selectedRange && (product.price < selectedRange.min || product.price > selectedRange.max)) {
        return false;
      }
      return true;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  verRelacionados(product: Product) {
    // Filtra productos relacionados por categoría y tipo
    this.selectedCategory = product.category || '';
    this.selectedType = product.type || '';
    this.selectedPriceRange = '';
    this.showOnlyInStock = false;
    this.applyFilters();
  }

  clearFilters() {
    this.selectedCategory = '';
    this.selectedType = '';
    this.selectedPriceRange = '';
    this.showOnlyInStock = false;
    this.applyFilters();
  }

  setActiveTab(tab: 'todos' | 'playstation' | 'xbox' | 'nintendo') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.applyFilters();
  }

  setActiveSection(section: 'juegos' | 'consolas' | 'accesorios') {
    this.activeSection = section;
  }

  getSectionProducts(): Product[] {
    if (this.activeSection === 'juegos') {
      return this.products.filter(p => p.type === 'juego');
    } else if (this.activeSection === 'consolas') {
      // Aquí puedes filtrar por tipo consola si tienes esa info
      return this.products.filter(p => p.category === 'Consolas');
    } else if (this.activeSection === 'accesorios') {
      // Aquí puedes filtrar por tipo accesorio si tienes esa info
      return this.products.filter(p => p.category === 'Accesorios');
    }
    return this.products;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Acción': '#ff6b35',
      'Aventura': '#4ecdc4',
      'RPG': '#45b7d1',
      'Deportes': '#3498db',
      'Estrategia': '#9b59b6',
      'Simulación': '#e74c3c',
      'Consolas': '#007bff',
      'Accesorios': '#6c757d'
    };
    return colors[category] || '#6c757d';
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'juego': '#28a745',
      'consola': '#007bff',
      'accesorio': '#6c757d'
    };
    return colors[type] || '#6c757d';
  }

  toggleProductDetails(productId: string) {
    this.expandedProductId = this.expandedProductId === productId ? null : productId;
  }

  isProductExpanded(productId: string): boolean {
    return this.expandedProductId === productId;
  }

  buyProduct(product: Product) {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      type: product.type, // Now supports 'juego', 'consola', 'accesorio'
      imageUrl: product.imageUrl,
      brand: product.brand
    });
    this.showSuccessMessage('Producto añadido al carrito');
  }

  private showSuccessMessage(message: string) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">${message}</span>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  getProductDetails(product: Product): any {
    const details: { [key: string]: any } = {
      'Marvel\'s Spider-Man 2': {
        releaseDate: 'Septiembre 2023',
        developer: 'Insomniac Games',
        publisher: 'Sony Interactive Entertainment',
        genre: 'Acción, Aventura',
        platform: 'PlayStation 5, Xbox Series X/S, PC'
      },
      'The Legend of Zelda: Tears of the Kingdom': {
        releaseDate: 'Mayo 2023',
        developer: 'Nintendo',
        publisher: 'Nintendo',
        genre: 'Aventura, RPG',
        platform: 'Nintendo Switch'
      },
      'Starfield': {
        releaseDate: 'Septiembre 2023',
        developer: 'Bethesda Game Studios',
        publisher: 'Bethesda Softworks',
        genre: 'RPG, Aventura',
        platform: 'PlayStation 5, Xbox Series X/S, PC'
      }
    };
    
    return details[product.name] || {
      releaseDate: 'Información no disponible',
      developer: 'Información no disponible',
      publisher: 'Información no disponible',
      genre: 'Información no disponible',
      platform: 'Información no disponible'
    };
  }
    buyGame(game: Game) {
    if (game.stock > 0) {
      // Agregar al carrito
      this.cartService.addToCart({
        id: game._id,
        name: game.name,
        price: game.precio,
        type: 'juego',
        imageUrl: game.imageUrl,
        brand: game.publisher
      });
    }
}
}