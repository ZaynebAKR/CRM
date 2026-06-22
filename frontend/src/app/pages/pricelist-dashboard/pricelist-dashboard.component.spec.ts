import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricelistDashboardComponent } from './pricelist-dashboard.component';

describe('PricelistDashboardComponent', () => {
  let component: PricelistDashboardComponent;
  let fixture: ComponentFixture<PricelistDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PricelistDashboardComponent]
    });
    fixture = TestBed.createComponent(PricelistDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
