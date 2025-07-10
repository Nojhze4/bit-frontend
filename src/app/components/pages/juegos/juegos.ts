import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CurrencyPipe, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-juegos',
  imports: [RouterModule, CurrencyPipe, NgIf, NgFor],
  templateUrl: './juegos.html',
  styleUrls: ['./juegos.css']
})
export class Juegos implements OnInit {
  games: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:4000/games').subscribe({
      next: (data) => {
        this.games = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar los juegos.';
        this.isLoading = false;
      }
    });
  }
}
