import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';

import { TrackingCardComponent } from './tracking-card.component';
import {
  createTestingEnvironment,
  MOCK_TRACKING_SESSIONS,
} from 'src/testing/shared-testing-config';

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
    let tracking = MOCK_TRACKING_SESSIONS[0];
    component.tracking = {
      ...tracking,
      notes: '',
      is_active: true,
      activityRef: {
        id: tracking.activityId,
        converter: null,
        type: null as any,
        firestore: null as any,
        path: '',
        parent: null as any,
        withConverter: () => null as any,
        toJSON: () => null as any,
      },
      toDB() {
        return {
          id: this.id,
          notes: this.notes,
          duration: this.duration,
          is_active: this.is_active,
        };
      },
    };

    component.activityService = testEnv.mocks.services.mockActivityService;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
