import { TestBed } from '@angular/core/testing';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: any;

  beforeEach(async () => {
    const firebaseModule = createFirebaseTestingModule();
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [...firebaseModule.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
