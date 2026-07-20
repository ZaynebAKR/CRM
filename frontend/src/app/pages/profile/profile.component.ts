import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileStateService } from 'src/app/profile-state.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  name: string = '';
  email: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  profileImage: string | null = null;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private profileState: ProfileStateService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>('http://localhost:8081/auth/me', { headers }).subscribe({
      next: (user) => {
        this.name = user.username;
        this.email = user.email;
        this.profileImage = user.profileImageUrl
          ? 'http://localhost:8081' + user.profileImageUrl
          : null;

        this.profileState.setProfile({
          username: this.name,
          email: this.email,
          profileImageUrl: this.profileImage
        });
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le profil.';
      }
    });
  }

  triggerImageInput(): void {
    document.getElementById('imageInput')?.click();
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => { this.profileImage = reader.result as string; };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post<{ imageUrl: string }>(
      'http://localhost:8081/auth/upload-profile-image',
      formData,
      { headers }
    ).subscribe({
      next: (res) => {
        this.profileImage = 'http://localhost:8081' + res.imageUrl;
        this.profileState.updateImage(this.profileImage);
        this.successMessage = 'Photo mise à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erreur lors de l'envoi de l'image.";
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  saveName(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put<any>(
      'http://localhost:8081/auth/update-profile',
      { name: this.name, email: this.email },
      { headers }
    ).subscribe({
      next: (res) => {
        // Le username a pu changer -> le token a changé, il faut le remplacer
        this.authService.setToken(res.token);

        this.name = res.username;
        this.email = res.email;

        this.profileState.updateNameEmail(this.name, this.email);

        this.successMessage = 'Information updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error updating profile.';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  savePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters!';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.successMessage = 'Password updated successfully!';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  cancelEdit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loadProfile();
  }
}