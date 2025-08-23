import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { TrackingComponent } from './tracking.component';
import { BehaviorSubject } from 'rxjs';

describe('TrackingComponent', () => {
  let component: TrackingComponent;
  let fixture: ComponentFixture<TrackingComponent>;

  beforeEach(waitForAsync(() => {
    const firebaseModule = createFirebaseTestingModule();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TrackingComponent],
      providers: [
        ...firebaseModule.providers,
        ModalController,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                activityId: 'testActivityId',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
