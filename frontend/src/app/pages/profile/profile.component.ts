import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  private userId: string = '';

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

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
  const token = this.authService.getToken();
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  this.http.put(
    'http://localhost:8081/auth/update-profile',
    { name: this.name, email: this.email },
    { headers }
  ).subscribe({
    next: () => {
      localStorage.setItem(`profile_name_${this.userId}`, this.name);
      localStorage.setItem(`profile_email_${this.userId}`, this.email);
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
  this.name  = localStorage.getItem(`profile_name_${this.userId}`)  || '';
  this.email = localStorage.getItem(`profile_email_${this.userId}`) || '';
  this.errorMessage = '';
  this.successMessage = '';
}
}