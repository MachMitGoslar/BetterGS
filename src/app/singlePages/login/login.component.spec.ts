import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { LoginComponent } from './login.component';
import { createTestingEnvironment } from 'src/testing/shared-testing-config';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
    // Setup $localize for Angular i18n
    (globalThis as any).$localize = (
      template: TemplateStringsArray,
      ...expressions: any[]
    ) => {
      let result = template[0];
      for (let i = 0; i < expressions.length; i++) {
        result += expressions[i] + template[i + 1];
      }
      return result;
    };

    const testEnv = createTestingEnvironment();
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), LoginComponent],
      providers: testEnv.providers,
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
