import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-insomea-dashboard',
  templateUrl: './insomea-dashboard.component.html',
  styleUrls: ['./insomea-dashboard.component.css']
})
export class InsomeaDashboardComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
}
}