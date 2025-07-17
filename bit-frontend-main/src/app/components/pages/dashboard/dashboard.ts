import { Component, OnInit } from '@angular/core';
import { GamesService, Game } from '../../../services/games.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, CommonModule } from '@angular/common';

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
    multiplayer: false
  };

  constructor(private gamesService: GamesService, private router: Router) {}

  ngOnInit() {
    this.loadGames();
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

  addGame() {
    if (!this.newGame.name || !this.newGame.consola || !this.newGame.genero || !this.newGame.descripcion || this.newGame.precio === undefined) {
      this.error = 'Todos los campos son requeridos: nombre, consola, género, descripción y precio';
      return;
    }
    
    this.gamesService.createGame(this.newGame as Omit<Game, '_id' | 'createdAt' | 'updatedAt'>).subscribe({
      next: (response) => {
        if (response.allOK) {
          this.games.push(response.data);
          this.showAddForm = false;
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
            multiplayer: false
          };
          this.error = null;
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.error = 'Error al agregar el juego.';
        console.error('Error:', err);
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
}
