import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accesorios',
  imports: [RouterModule],
  templateUrl: './accesorios.html',
  styleUrls: ['./accesorios.css']
})
export class Accesorios {
  private gamesUrl = 'http://localhost:4000/games';

  constructor(private httpClient: HttpClient) {
    this.getGames();
  }

  getGames() {
    this.httpClient.get(this.gamesUrl).subscribe({
      next: (data) => {
        console.log('Games:', data);
      },
      error: (err) => {
        console.error('Error fetching games:', err);
      }
    });
  }
}


