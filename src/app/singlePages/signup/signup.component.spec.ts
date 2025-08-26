import { TestBed } from '@angular/core/testing';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { SignupComponent } from './signup.component';
import { createTestingEnvironment } from 'src/testing/shared-testing-config';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: any;

  beforeEach(async () => {
    const testEnv = createTestingEnvironment();
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [...testEnv.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
