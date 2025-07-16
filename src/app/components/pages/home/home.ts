import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeService, HomeData, Category, Feature } from '../../../services/home.service';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  homeData: HomeData | null = null;
  categories: Category[] = [];
  features: Feature[] = [];
  featuredGames: any[] = [];
  isLoading = true;
  error: string | null = null;

 

  constructor(private homeService: HomeService) {}

  ngOnInit() {
    this.loadHomeData();
  }

  loadHomeData() {
    this.isLoading = true;
    this.error = null;

    this.homeService.getHomeData().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.homeData = response.data;
          this.categories = response.data.categories;
          this.features = response.data.features;
          this.featuredGames = response.data.featuredGames;
        } else {
          this.error = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos de la página de inicio';
        this.isLoading = false;
        console.error('Error loading home data:', err);
      }
    });
  }
}
