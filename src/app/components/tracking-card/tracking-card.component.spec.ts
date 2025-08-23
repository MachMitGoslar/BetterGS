import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { TrackingCardComponent } from './tracking-card.component';

describe('TrackingCardComponent', () => {
  let component: TrackingCardComponent;
  let fixture: ComponentFixture<TrackingCardComponent>;

  beforeEach(waitForAsync(() => {
    const firebaseModule = createFirebaseTestingModule();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TrackingCardComponent],
      providers: [...firebaseModule.providers, ModalController],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
