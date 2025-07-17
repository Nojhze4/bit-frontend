import { Component, OnInit } from '@angular/core';
import { GamesService, Game } from '../../../services/games.service';
import { UploadService } from '../../../services/upload.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { ProductService, ProductModel } from '../../../services/product.service';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, CurrencyPipe, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  games: Game[] = [];
  isLoading = true;
  error: string | null = null;
  editIndex: number | null = null;
  editedGame: Partial<Game> = {};
  showAddForm = false;
  newGame: Partial<Game> = {
    name: '',
    consola: '',
    genero: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    developer: '',
    publisher: '',
    rating: 'E',
    multiplayer: false,
    imageUrl: ''
  };

  products: ProductModel[] = [];
  showAddProductForm = false;
  newProduct: Partial<ProductModel> = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: ''
  };
  selectedProductFile: File | null = null;

  constructor(
    private gamesService: GamesService,
    private productService: ProductService,
    private uploadService: UploadService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGames();
    this.loadProducts();
  }

  loadGames() {
    this.isLoading = true;
    this.gamesService.getAllGames().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.games = response.data;
        } else {
          this.error = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los juegos.';
        this.isLoading = false;
      }
    });
  }

  startEdit(index: number) {
    this.editIndex = index;
    this.editedGame = { ...this.games[index] };
  }

  cancelEdit() {
    this.editIndex = null;
    this.editedGame = {};
  }

  saveEdit(game: Game) {
    if (!this.editedGame.precio || !this.editedGame.stock) return;
    this.gamesService.updateGame(game._id, {
      precio: this.editedGame.precio,
      stock: this.editedGame.stock
    }).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.games[this.editIndex!] = { ...game, ...response.data };
          this.cancelEdit();
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Error al guardar los cambios.';
      }
    });
  }



  deleteGame(game: Game, index: number) {
    if (!confirm('¿Seguro que deseas eliminar este juego?')) return;
    this.gamesService.deleteGame(game._id).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.games.splice(index, 1);
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Error al eliminar el juego.';
      }
    });
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  getPriceClass(precio: number): string {
    if (precio <= 50000) return 'price-low';
    if (precio <= 100000) return 'price-medium';
    return 'price-high';
  }

  getStockClass(stock: number): string {
    if (stock <= 5) return 'stock-low';
    if (stock <= 15) return 'stock-medium';
    return 'stock-high';
  }

  async addGame() {
    if (!this.newGame.name || !this.newGame.consola || !this.newGame.genero || !this.newGame.descripcion || this.newGame.precio === undefined) {
      this.error = 'Todos los campos son requeridos: nombre, consola, género, descripción y precio';
      return;
    }
    
    try {
      const gameData = {
        ...this.newGame
      } as Omit<Game, '_id' | 'createdAt' | 'updatedAt'>;
      
      this.gamesService.createGame(gameData).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.games.push(response.data);
            this.showAddForm = false;
            this.resetForm();
            this.error = null;
            // Redirigir a la página de productos
            this.router.navigate(['/productos']);
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Error al agregar el juego.';
          console.error('Error:', err);
        }
      });
    } catch (error) {
      this.error = error as string;
    }
  }

  resetForm() {
    this.newGame = {
      name: '',
      consola: '',
      genero: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      developer: '',
      publisher: '',
      rating: 'E',
      multiplayer: false,
      imageUrl: ''
    };
  }

  onGameImageSelected(event: any, game: Game): void {
    const file = event.target.files?.[0];
    if (file) {
      this.updateGameImage(game, file);
    }
  }

  async updateGameImage(game: Game, file: File): Promise<void> {
    try {
      this.uploadService.uploadGameImage(file, game._id).subscribe({
        next: (response) => {
          if (response.allOK) {
            // Update the game with new image URL
            this.gamesService.updateGame(game._id, { imageUrl: response.data.imageUrl }).subscribe({
              next: (updateResponse) => {
                if (updateResponse.allOK) {
                  const index = this.games.findIndex(g => g._id === game._id);
                  if (index !== -1) {
                    this.games[index] = { ...this.games[index], imageUrl: response.data.imageUrl };
                  }
                }
              }
            });
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Error al actualizar la imagen del juego.';
        }
      });
    } catch (error) {
      this.error = error as string;
    }
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.products = response.data;
        }
      }
    });
  }

  onProductFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedProductFile = file;
  }

  async addProduct() {
    const productData = {
      ...this.newProduct
    } as Omit<ProductModel, '_id' | 'createdAt' | 'updatedAt'>;
    this.productService.createProduct(productData).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.products.push(response.data);
          this.showAddProductForm = false;
          this.newProduct = { name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '' };
          this.selectedProductFile = null;
          // Redirigir a la página de productos
          this.router.navigate(['/productos']);
        }
      }
    });
  }
}
