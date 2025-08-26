import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';

import { TrackingCardComponent } from './tracking-card.component';
import { createTestingEnvironment } from 'src/testing/shared-testing-config';

describe('TrackingCardComponent', () => {
  let component: TrackingCardComponent;
  let fixture: ComponentFixture<TrackingCardComponent>;

  beforeEach(waitForAsync(() => {
    const testEnv = createTestingEnvironment();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TrackingCardComponent],
      providers: [...testEnv.providers, ModalController],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
