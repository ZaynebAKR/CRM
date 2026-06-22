import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  name: string = '';
  email: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  profileImage: string | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  private userId: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userId = user?.username || '';
    this.name         = localStorage.getItem(`profile_name_${this.userId}`)  || '';
    this.email        = localStorage.getItem(`profile_email_${this.userId}`) || '';
    this.profileImage = localStorage.getItem(`profile_image_${this.userId}`) || null;
  }

  triggerImageInput(): void {
    document.getElementById('imageInput')?.click();
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string;
        localStorage.setItem(`profile_image_${this.userId}`, this.profileImage);
        this.successMessage = 'Photo updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      };
      reader.readAsDataURL(file);
    }
  }

  saveName(): void {
    localStorage.setItem(`profile_name_${this.userId}`, this.name);
    localStorage.setItem(`profile_email_${this.userId}`, this.email);
    this.successMessage = 'Information updated successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  resetForm(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
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

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post(
      'http://localhost:8081/auth/change-password',
      { currentPassword: this.currentPassword, newPassword: this.newPassword },
      { headers }
    ).subscribe({
      next: () => {
        this.successMessage = 'Password updated successfully!';
        this.resetForm();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Current password is incorrect!';
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}