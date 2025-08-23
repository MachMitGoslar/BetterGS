import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { ProfilePictureComponent } from './profile-picture.component';

describe('ProfilePictureComponent', () => {
  let component: ProfilePictureComponent;
  let fixture: ComponentFixture<ProfilePictureComponent>;

  beforeEach(waitForAsync(() => {
    const firebaseModule = createFirebaseTestingModule();
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ProfilePictureComponent],
      providers: firebaseModule.providers,
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
