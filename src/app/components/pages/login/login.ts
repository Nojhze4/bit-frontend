import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importa HttpClient
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  games: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:4000/games').subscribe({
      next: (data) => {
        this.games = data;
        console.log('Games:', this.games);
      },
      error: (err) => {
        console.error('Error fetching games:', err);
      }
    });
  }
}