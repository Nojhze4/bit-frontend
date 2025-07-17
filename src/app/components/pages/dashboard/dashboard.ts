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

  editConsoleIndex: number | null = null;
  editedConsole: Partial<ProductModel> = {};
  editAccessoryIndex: number | null = null;
  editedAccessory: Partial<ProductModel> = {};
  successMessage: string | null = null;

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
            this.successMessage = 'Juego agregado exitosamente';
            setTimeout(() => this.successMessage = null, 2500);
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

  async addConsole() {
    if (!this.newConsole.name || !this.newConsole.brand || !this.newConsole.model || !this.newConsole.description || this.newConsole.price === undefined) {
      this.error = 'Todos los campos son requeridos: nombre, marca, modelo, descripción y precio';
      return;
    }
    try {
      let imageUrl = '';
      if (this.newConsole.selectedFile) {
        imageUrl = await this.uploadConsoleImage();
      }
      const consoleData = {
        ...this.newConsole,
        imageUrl,
        category: this.newConsole.brand // Asegura que category esté presente
      };
      this.productService.createConsole(consoleData).subscribe({
        next: (response) => {
          console.log('Respuesta backend:', response);
          if (response.allOK) {
            // Forzar el campo category en el objeto recibido
            const newConsole = { ...response.data, category: (response.data as any).brand || '' };
            this.consoles.push(newConsole);
            this.showAddConsoleForm = false;
            this.resetConsoleForm();
            this.error = null;
            this.successMessage = 'Consola agregada exitosamente';
            setTimeout(() => this.successMessage = null, 2500);
          } else {
            this.error = response.message;
            console.error('Error de backend:', response.message);
          }
        },
        error: (err) => {
          this.error = 'Error al agregar la consola.';
          console.error('Error en observable:', err);
        }
      });
    } catch (error) {
      this.error = error as string;
      console.error('Error en catch:', error);
    }
  }

  async addAccessory() {
    if (!this.newAccessory.name || !this.newAccessory.category || !this.newAccessory.description || this.newAccessory.price === undefined) {
      this.error = 'Todos los campos son requeridos: nombre, categoría, descripción y precio';
      return;
    }
    try {
      let imageUrl = '';
      if (this.newAccessory.selectedFile) {
        imageUrl = await this.uploadAccessoryImage();
      }
      const accessoryData = {
        ...this.newAccessory,
        imageUrl
      };
      this.productService.createAccessory(accessoryData).subscribe({
        next: (response) => {
          if (response.allOK) {
            this.accessories.push(response.data);
            this.showAddAccessoryForm = false;
            this.resetAccessoryForm();
            this.error = null;
            this.successMessage = 'Accesorio agregado exitosamente';
            setTimeout(() => this.successMessage = null, 2500);
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.error = 'Error al agregar el accesorio.';
          console.error('Error:', err);
        }
      });
    } catch (error) {
      this.error = error as string;
    }
  }

  resetConsoleForm() {
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
  }

  resetAccessoryForm() {
    this.newAccessory = { name: '', price: 0, category: '', stock: 0, description: '', imageUrl: '', selectedFile: null, brand: '' };
  }

  uploadConsoleImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.newConsole.selectedFile) {
        reject('No hay archivo seleccionado para la consola');
        return;
      }
      this.isUploading = true;
      this.uploadService.uploadImage(this.newConsole.selectedFile).subscribe({
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
          reject('Error al subir la imagen de la consola');
        }
      });
    });
  }

  uploadAccessoryImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.newAccessory.selectedFile) {
        reject('No hay archivo seleccionado para el accesorio');
        return;
      }
      this.isUploading = true;
      this.uploadService.uploadImage(this.newAccessory.selectedFile).subscribe({
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
          reject('Error al subir la imagen del accesorio');
        }
      });
    });
  }

  startEditConsole(index: number) {
    this.editConsoleIndex = index;
    this.editedConsole = { ...this.consoles[index] };
  }

  cancelEditConsole() {
    this.editConsoleIndex = null;
    this.editedConsole = {};
  }

  saveEditConsole(consoleItem: ProductModel) {
    if (!this.editedConsole.price || !this.editedConsole.stock) return;
    this.productService.updateProduct(consoleItem._id, {
      name: this.editedConsole.name,
      price: this.editedConsole.price,
      stock: this.editedConsole.stock,
      category: this.editedConsole.category,
      description: this.editedConsole.description
    }).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.consoles[this.editConsoleIndex!] = { ...consoleItem, ...response.data };
          this.cancelEditConsole();
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Error al guardar los cambios de la consola.';
      }
    });
  }

  deleteConsole(consoleItem: ProductModel, index: number) {
    if (!confirm('¿Seguro que deseas eliminar esta consola?')) return;
    this.productService.deleteConsole(consoleItem._id).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.consoles.splice(index, 1);
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Error al eliminar la consola.';
      }
    });
  }

  startEditAccessory(index: number) {
    this.editAccessoryIndex = index;
    this.editedAccessory = { ...this.accessories[index] };
  }

  cancelEditAccessory() {
    this.editAccessoryIndex = null;
    this.editedAccessory = {};
  }

  saveEditAccessory(accessoryItem: ProductModel) {
    if (!this.editedAccessory.price || !this.editedAccessory.stock) return;
    this.productService.updateProduct(accessoryItem._id, {
      name: this.editedAccessory.name,
      price: this.editedAccessory.price,
      stock: this.editedAccessory.stock,
      category: this.editedAccessory.category,
      description: this.editedAccessory.description
    }).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.accessories[this.editAccessoryIndex!] = { ...accessoryItem, ...response.data };
          this.cancelEditAccessory();
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Error al guardar los cambios del accesorio.';
      }
    });
  }

  deleteAccessory(accessoryItem: ProductModel, index: number) {
    if (!confirm('¿Seguro que deseas eliminar este accesorio?')) return;
    this.productService.deleteAccessory(accessoryItem._id).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.accessories.splice(index, 1);
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Error al eliminar el accesorio.';
      }
    });
  }
}
