import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrosoftDashboardComponent } from './microsoft-dashboard.component';

describe('MicrosoftDashboardComponent', () => {
  let component: MicrosoftDashboardComponent;
  let fixture: ComponentFixture<MicrosoftDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MicrosoftDashboardComponent]
    });
    fixture = TestBed.createComponent(MicrosoftDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
