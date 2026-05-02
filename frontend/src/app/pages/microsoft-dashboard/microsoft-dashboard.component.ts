import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-microsoft-dashboard',
  templateUrl: './microsoft-dashboard.component.html',
  styleUrls: ['./microsoft-dashboard.component.css']
})
export class MicrosoftDashboardComponent {

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
