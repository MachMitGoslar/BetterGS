import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { ActivityListComponent } from './activity-list.component';
import { createTestingEnvironment } from 'src/testing/shared-testing-config';

describe('ActivityListComponent', () => {
  let component: ActivityListComponent;
  let fixture: ComponentFixture<ActivityListComponent>;

  beforeEach(waitForAsync(() => {
    const testEnv = createTestingEnvironment();
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ActivityListComponent],
      providers: testEnv.providers,
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
