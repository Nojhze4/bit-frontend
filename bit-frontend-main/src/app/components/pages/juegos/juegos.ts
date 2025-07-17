import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CurrencyPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesService, Game } from '../../../services/games.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-juegos',
  imports: [RouterModule, CurrencyPipe, NgIf, NgFor, FormsModule],
  templateUrl: './juegos.html',
  styleUrls: ['./juegos.css']
})
export class Juegos implements OnInit {
  games: Game[] = [];
  filteredGames: Game[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Filtros
  selectedConsole: string = '';
  selectedGenre: string = '';
  selectedPriceRange: string = '';
  showOnlyInStock: boolean = false;
  showOnlyMultiplayer: boolean = false;
  
  // Menú hamburguesa
  filtersOpen: boolean = false;

  // Opciones de filtros
  consoles = ['PlayStation', 'Xbox', 'Nintendo'];
  genres = ['Acción', 'Aventura', 'RPG', 'Estrategia', 'Deportes', 'Carreras', 'Shooter', 'Plataformas', 'Puzzle', 'Otros'];
  priceRanges = [
    { label: 'Todos los precios', min: 0, max: 999999999 },
    { label: 'Menos de $120.000', min: 0, max: 120000 },
    { label: '$120.000 - $200.000', min: 120000, max: 200000 },
    { label: '$200.000 - $280.000', min: 200000, max: 280000 },
    { label: 'Más de $280.000', min: 280000, max: 999999999 }
  ];

  playstationGames: Game[] = [];
  xboxGames: Game[] = [];
  nintendoGames: Game[] = [];
  showSection: 'all' | 'playstation' | 'xbox' | 'nintendo' = 'all';

  constructor(private gamesService: GamesService, private cartService: CartService) {}

  ngOnInit() {
    this.loadGames();
    this.loadPlaystation();
    this.loadXbox();
    this.loadNintendo();
  }

  loadGames() {
    this.isLoading = true;
    this.error = null;

    // Construir parámetros de filtro
    const params: any = {};
    if (this.selectedConsole) params.consola = this.selectedConsole;
    if (this.selectedGenre) params.genero = this.selectedGenre;
    if (this.showOnlyInStock) params.inStock = true;
    if (this.showOnlyMultiplayer) params.multiplayer = true;

    // Aplicar filtro de precio
    const selectedPriceRange = this.priceRanges.find(range => 
      range.label === this.selectedPriceRange
    );
    if (selectedPriceRange) {
      params.minPrice = selectedPriceRange.min;
      params.maxPrice = selectedPriceRange.max;
    }

    this.gamesService.getAllGames(params).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.games = response.data;
          this.filteredGames = [...this.games];
        } else {
          this.error = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los juegos.';
        this.isLoading = false;
        console.error('Error loading games:', err);
      }
    });
  }

  loadPlaystation() {
    this.gamesService.getPlaystationGames().subscribe({
      next: (response) => {
        if (response.allOK) this.playstationGames = response.data;
      }
    });
  }
  loadXbox() {
    this.gamesService.getXboxGames().subscribe({
      next: (response) => {
        if (response.allOK) this.xboxGames = response.data;
      }
    });
  }
  loadNintendo() {
    this.gamesService.getNintendoGames().subscribe({
      next: (response) => {
        if (response.allOK) this.nintendoGames = response.data;
      }
    });
  }

  // Métodos de filtrado
  filterByConsole(console: string) {
    this.selectedConsole = this.selectedConsole === console ? '' : console;
    this.loadGames();
  }

  filterByGenre(genre: string) {
    this.selectedGenre = this.selectedGenre === genre ? '' : genre;
    this.loadGames();
  }

  filterByPriceRange() {
    this.loadGames();
  }

  toggleInStock() {
    this.showOnlyInStock = !this.showOnlyInStock;
    this.loadGames();
  }

  toggleMultiplayer() {
    this.showOnlyMultiplayer = !this.showOnlyMultiplayer;
    this.loadGames();
  }

  clearFilters() {
    this.selectedConsole = '';
    this.selectedGenre = '';
    this.selectedPriceRange = '';
    this.showOnlyInStock = false;
    this.showOnlyMultiplayer = false;
    this.loadGames();
  }

  // Métodos del menú hamburguesa
  toggleFilters() {
    this.filtersOpen = !this.filtersOpen;
  }

  // Método para comprar juego
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
      
      // Mostrar notificación de éxito
      this.showSuccessMessage(`${game.name} agregado al carrito`);
      
      // Mostrar el carrito después de un breve delay
      setTimeout(() => {
        this.cartService.showCart();
      }, 500);
      
      // Reducir stock (en una implementación real esto se haría en el backend)
      game.stock--;
      
      // Actualizar juegos filtrados
      this.applyFilters();
    }
  }

  // Mostrar mensaje de éxito
  private showSuccessMessage(message: string) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">${message}</span>
      </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Aplicar filtros
  applyFilters() {
    this.loadGames();
  }

  // Obtener el color de la consola para el badge
  getConsoleColor(console: string): string {
    const colors: { [key: string]: string } = {
      'PlayStation': '#003791',
      'Xbox': '#107C10',
      'Nintendo': '#E60012'
    };
    return colors[console] || '#6C757D';
  }

  // Obtener el color del género
  getGenreColor(genre: string): string {
    const colors: { [key: string]: string } = {
      'Acción': '#DC3545',
      'Aventura': '#28A745',
      'RPG': '#6F42C1',
      'Estrategia': '#FD7E14',
      'Deportes': '#20C997',
      'Carreras': '#FFC107',
      'Shooter': '#E83E8C',
      'Plataformas': '#17A2B8',
      'Puzzle': '#6C757D',
      'Otros': '#495057'
    };
    return colors[genre] || '#6C757D';
  }

}
