import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  profileImage: string | null = null;
  name: string = '';
  role: string = '';

  constructor(private authService: AuthService, private router: Router) {}

ngOnInit(): void {
  const user = this.authService.getUser();
  this.role = user?.role || '';
  this.name = user?.username || '';

  const userId = user?.username || '';
  this.profileImage = localStorage.getItem(`profile_image_${userId}`) || null;
}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}