import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { ActivityListComponent } from './activity-list.component';

describe('ActivityListComponent', () => {
  let component: ActivityListComponent;
  let fixture: ComponentFixture<ActivityListComponent>;

  beforeEach(waitForAsync(() => {
    const firebaseModule = createFirebaseTestingModule();
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ActivityListComponent],
      providers: firebaseModule.providers,
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
