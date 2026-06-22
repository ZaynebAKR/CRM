import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiOptimizerComponent } from './ai-optimizer.component';

describe('AiOptimizerComponent', () => {
  let component: AiOptimizerComponent;
  let fixture: ComponentFixture<AiOptimizerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AiOptimizerComponent]
    });
    fixture = TestBed.createComponent(AiOptimizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
