import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  
  constructor(public router: Router) {}

  get showChatbot(): boolean {
    const hiddenRoutes = ['/login', '/register', '/aboutus'];
    return !hiddenRoutes.some(route => this.router.url.startsWith(route));
  }
}