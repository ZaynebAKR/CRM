import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsomeaDashboardComponent } from './insomea-dashboard.component';

describe('InsomeaDashboardComponent', () => {
  let component: InsomeaDashboardComponent;
  let fixture: ComponentFixture<InsomeaDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InsomeaDashboardComponent]
    });
    fixture = TestBed.createComponent(InsomeaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
