import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { createTestingEnvironment } from '../../../testing/shared-testing-config';

import { TrackingComponent } from './tracking.component';
import { BehaviorSubject } from 'rxjs';
import { I18nService } from 'src/app/core/services/i18n.service';

describe('TrackingComponent', () => {
  let component: TrackingComponent;
  let fixture: ComponentFixture<TrackingComponent>;

  beforeEach(waitForAsync(() => {
    const testEnv = createTestingEnvironment();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TrackingComponent],
      providers: [
        ...testEnv.providers,
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
