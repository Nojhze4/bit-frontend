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
  selectedFile: File | null = null;

  isUploading = false;
  consoles: ProductModel[] = [];
  accessories: ProductModel[] = [];
  showAddConsoleForm = false;
  showAddAccessoryForm = false;
  newConsole: Partial<ProductModel> & { selectedFile?: File | null, brand?: string, model?: string, features?: string, releaseYear?: number, color?: string } = {
    name: '',
    brand: '',
    model: '',
    price: 0,
    stock: 0,
    description: '',
    imageUrl: '',
    selectedFile: null,
    features: '',
    releaseYear: undefined,
    color: ''
  };
  newAccessory: Partial<ProductModel> & { selectedFile?: File | null, brand?: string } = { name: '', price: 0, category: '', stock: 0, description: '', imageUrl: '', selectedFile: null, brand: '' };

  constructor(
    private gamesService: GamesService,
    private productService: ProductService,
    private uploadService: UploadService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGames();
    this.loadConsoles();
    this.loadAccessories();
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona un archivo de imagen válido.';
        return;
      }
      // Validar tamaño de archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'El archivo es demasiado grande. Máximo 5MB.';
        return;
      }
      this.selectedFile = file;
      this.error = null;
    }
  }

  uploadImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        reject('No hay archivo seleccionado');
        return;
      }
      this.isUploading = true;
      this.uploadService.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          this.isUploading = false;
          if (response.allOK) {
            resolve(response.data.imageUrl);
          } else {
            reject(response.message);
          }
        },
        error: (err) => {
          this.isUploading = false;
          reject('Error al subir la imagen');
        }
      });
    });
  }

  async addGame() {
    if (!this.newGame.name || !this.newGame.consola || !this.newGame.genero || !this.newGame.descripcion || this.newGame.precio === undefined) {
      this.error = 'Todos los campos son requeridos: nombre, consola, género, descripción y precio';
      return;
    }
    try {
      let imageUrl = '';
      if (this.selectedFile) {
        imageUrl = await this.uploadImage();
      }
      const gameData = {
        ...this.newGame,
        imageUrl
      } as Omit<Game, '_id' | 'createdAt' | 'updatedAt'>;
      this.gamesService.createGame(gameData).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.games.push(response.data);
            this.showAddForm = false;
            this.resetForm();
            this.error = null;
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
    this.selectedFile = null;
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

  loadConsoles() {
    this.productService.getConsoles().subscribe({
      next: (response) => {
        if (response.allOK) this.consoles = response.data;
      }
    });
  }

  loadAccessories() {
    this.productService.getAccessories().subscribe({
      next: (response) => {
        if (response.allOK) this.accessories = response.data;
      }
    });
  }

  onConsoleImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newConsole.selectedFile = file;
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.newConsole.imageUrl = response.data.imageUrl;
          }
        }
      });
    }
  }

  onAccessoryImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newAccessory.selectedFile = file;
      this.uploadService.uploadImage(file).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.newAccessory.imageUrl = response.data.imageUrl;
          }
        }
      });
    }
  }

  addConsole() {
    const consoleData = {
      name: this.newConsole.name,
      brand: this.newConsole.brand,
      model: this.newConsole.model,
      price: this.newConsole.price,
      stock: this.newConsole.stock,
      description: this.newConsole.description,
      imageUrl: this.newConsole.imageUrl,
      features: this.newConsole.features,
      releaseYear: this.newConsole.releaseYear,
      color: this.newConsole.color
    };

    this.productService.createConsole(consoleData).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.consoles.push(response.data);
          this.showAddConsoleForm = false;
          this.newConsole = {
            name: '',
            brand: '',
            model: '',
            price: 0,
            stock: 0,
            description: '',
            imageUrl: '',
            selectedFile: null,
            features: '',
            releaseYear: undefined,
            color: ''
          };
          this.router.navigate(['/productos']);
        }
      }
    });
  }

  addAccessory() {
    const accessoryData = {
      name: this.newAccessory.name,
      category: this.newAccessory.category,
      brand: this.newAccessory.brand,
      price: this.newAccessory.price,
      stock: this.newAccessory.stock,
      description: this.newAccessory.description,
      imageUrl: this.newAccessory.imageUrl
    };

    this.productService.createAccessory(accessoryData).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.accessories.push(response.data);
          this.showAddAccessoryForm = false;
          this.newAccessory = { name: '', price: 0, category: '', stock: 0, description: '', imageUrl: '', selectedFile: null, brand: '' };
          this.router.navigate(['/productos']);
        }
      }
    });
  }
}
