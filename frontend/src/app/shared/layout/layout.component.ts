import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileStateService } from 'src/app/profile-state.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {

  profileImage: string | null = null;
  name: string = '';
  role: string = '';

  private sub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private profileState: ProfileStateService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.role = user?.role || '';

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>('http://localhost:8081/auth/me', { headers }).subscribe({
      next: (u) => {
        const image = u.profileImageUrl ? 'http://localhost:8081' + u.profileImageUrl : null;
        this.profileState.setProfile({
          username: u.username,
          email: u.email,
          profileImageUrl: image
        });
      }
    });

    this.sub = this.profileState.profile$.subscribe((profile) => {
      this.name = profile.username;
      this.profileImage = profile.profileImageUrl;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}