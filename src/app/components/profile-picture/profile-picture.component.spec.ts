import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { ProfilePictureComponent } from './profile-picture.component';
import { createTestingEnvironment } from 'src/testing/shared-testing-config';

describe('ProfilePictureComponent', () => {
  let component: ProfilePictureComponent;
  let fixture: ComponentFixture<ProfilePictureComponent>;

  beforeEach(waitForAsync(() => {
    const testEnv = createTestingEnvironment();
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ProfilePictureComponent],
      providers: testEnv.providers,
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
