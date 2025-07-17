import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-panel',
  imports: [RouterModule],
  templateUrl: './panel.html',
  styleUrls: ['./panel.css']
})
export class Panel {
  private gamesUrl = 'http://localhost:4000/games';

  constructor(private httpClient: HttpClient, private toastr: ToastrService) {
    this.getGames();
  }

  getGames() {
    this.httpClient.get(this.gamesUrl).subscribe({
      next: (data) => {
        this.toastr.success('Juegos cargados correctamente');
      },
      error: (err) => {
        console.error('Error fetching games:', err);
      }
    });
  }
}
  