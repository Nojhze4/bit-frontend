import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from './components/shared/navigation/navigation';
import { Header } from './components/shared/header/header';
import { Footer } from './components/shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, Header, Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
 
}
