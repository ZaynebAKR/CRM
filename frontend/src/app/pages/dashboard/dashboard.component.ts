import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  clientName: string = 'Client';
  currentSlide: number = 0;
  slides = Array(6);
  private timer: any;

  ngOnInit(): void {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.clientName = payload.sub || payload.username || 'Client';
    }
    this.startCarousel();
  }

startCarousel(): void {
  this.timer = setInterval(() => {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }, 3000);
}

  goToSlide(index: number): void {
    this.currentSlide = index;
    clearInterval(this.timer);
    this.startCarousel();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}