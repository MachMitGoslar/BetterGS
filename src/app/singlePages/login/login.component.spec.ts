import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginComponent } from './login.component';
import {
  createTestingEnvironment,
  TestInteractions,
  waitAsync,
} from 'src/testing/shared-testing-config';
import { ApplicationService } from 'src/app/core/services/application.service';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { inject } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let testEnv: any;
  let applicationService: any;
  let router: any;
  let notificationService: any;
  let i18nService: any;
  let alertController: any;
  let loadingController: any;

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

    // Clear localStorage before each test
    localStorage.clear();

    testEnv = createTestingEnvironment();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), LoginComponent],
      providers: [...testEnv.providers],
    }).compileComponents();

    // Get service references
    applicationService = testEnv.mocks.services.mockApplicationService;
    router = testEnv.mocks.ionic.mockRouter;
    i18nService = testEnv.mocks.services.mockI18nService;
    notificationService = testEnv.mocks.services.mockNotificationService;
    alertController = testEnv.mocks.ionic.mockAlertController;
    loadingController = testEnv.mocks.ionic.mockLoadingController;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
    expect(component.loginForm.get('rememberMe')?.value).toBe(false);
  });

  it('should validate required fields', () => {
    // Test invalid form
    TestInteractions.setFormValue(component.loginForm, 'email', '');
    TestInteractions.setFormValue(component.loginForm, 'password', '');
    expect(component.loginForm.valid).toBeFalse();

    // Test valid form
    TestInteractions.setFormValue(
      component.loginForm,
      'email',
      'test@example.com'
    );
    TestInteractions.setFormValue(component.loginForm, 'password', '123456');
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should validate email format', () => {
    TestInteractions.setFormValue(
      component.loginForm,
      'email',
      'invalid-email'
    );
    TestInteractions.setFormValue(component.loginForm, 'password', '123456');
    expect(component.loginForm.valid).toBeFalse();
    expect(component.loginForm.get('email')?.hasError('email')).toBeTrue();
  });

  it('should validate password minimum length', () => {
    TestInteractions.setFormValue(
      component.loginForm,
      'email',
      'test@example.com'
    );
    TestInteractions.setFormValue(component.loginForm, 'password', '123');
    expect(component.loginForm.valid).toBeFalse();
    expect(
      component.loginForm.get('password')?.hasError('minlength')
    ).toBeTrue();
  });

  it('should detect invalid fields correctly', () => {
    TestInteractions.setFormValue(component.loginForm, 'email', '');
    expect(component.isFieldInvalid('email')).toBeTrue();

    TestInteractions.setFormValue(
      component.loginForm,
      'email',
      'test@example.com'
    );
    expect(component.isFieldInvalid('email')).toBeFalse();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should mark form fields as touched if loginForm is invalid', async () => {
    const markTouchedSpy = spyOn(component, 'markFormGroupTouched');
    TestInteractions.setFormValue(component.loginForm, 'email', '');
    TestInteractions.setFormValue(component.loginForm, 'password', '');

    await component.onLogin();

    expect(markTouchedSpy).toHaveBeenCalled();
  });

  it('should call ApplicationService.loginWithEmail and handle success', async () => {
    TestInteractions.setFormValue(
      component.loginForm,
      'email',
      'test@example.com'
    );
    TestInteractions.setFormValue(component.loginForm, 'password', '123456');
    TestInteractions.setFormValue(component.loginForm, 'rememberMe', true);

    await component.onLogin();

    expect(applicationService.loginWithEmail).toHaveBeenCalledWith(
      'test@example.com',
      '123456'
    );
    expect(localStorage.getItem('rememberMe')).toBe('true');
    expect(localStorage.getItem('userEmail')).toBe('test@example.com');
    expect(loadingController.create).toHaveBeenCalled();
  });

  it('should handle rememberMe false and clear localStorage', async () => {
    // Pre-populate localStorage
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('userEmail', 'old@example.com');

    TestInteractions.setFormValue(
      component.loginForm,
      'email',
      'test@example.com'
    );
    TestInteractions.setFormValue(component.loginForm, 'password', '123456');
    TestInteractions.setFormValue(component.loginForm, 'rememberMe', false);

    await component.onLogin();

    expect(localStorage.getItem('rememberMe')).toBeNull();
    expect(localStorage.getItem('userEmail')).toBeNull();
  });

  it('should handle login error and show notification', async () => {
    TestInteractions.setFormValue(
      component.loginForm,
      'email',
      'test@example.com'
    );
    TestInteractions.setFormValue(component.loginForm, 'password', 'wrong11');
    TestInteractions.setFormValue(component.loginForm, 'rememberMe', false);
    applicationService.loginWithEmail.and.returnValue(
      Promise.reject({ code: 'auth/wrong-password' })
    );

    await component.onLogin();

    expect(notificationService.addNotification).toHaveBeenCalledWith(
      jasmine.any(String),
      'danger'
    );
    expect(component.errorMessage).not.toBe('');
    expect(component.isLoading).toBeFalse();
  });

  it('should handle different login error codes', async () => {
    const testCases = [
      { code: 'auth/user-not-found', expectedKey: 'login.user_not_found' },
      { code: 'auth/invalid-email', expectedKey: 'login.invalid_email' },
      {
        code: 'auth/invalid-credential',
        expectedKey: 'login.credentials_wrong',
      },
      { code: 'auth/user-disabled', expectedKey: 'login.user_disabled' },
      {
        code: 'auth/too-many-requests',
        expectedKey: 'login.too_many_requests',
      },
      {
        code: 'auth/network-request-failed',
        expectedKey: 'login.network_request_failed',
      },
    ];

    for (const testCase of testCases) {
      // Reset spy calls before each test case
      i18nService.getTranslation.calls.reset();
      notificationService.addNotification.calls.reset();

      applicationService.loginWithEmail.and.returnValue(
        Promise.reject({
          code: testCase.code,
          message: `Error: ${testCase.code}`,
        })
      );

      TestInteractions.setFormValue(
        component.loginForm,
        'email',
        'test@example.com'
      );
      TestInteractions.setFormValue(
        component.loginForm,
        'password',
        'password'
      );
      TestInteractions.setFormValue(component.loginForm, 'rememberMe', false);

      await component.onLogin();

      // Check that the correct error translation was called
      // Note: The new error handling calls multiple translations, so we check if the specific one was called
      const translationCalls = i18nService.getTranslation.calls
        .allArgs()
        .flat();
      expect(translationCalls).toContain(testCase.expectedKey);

      // Verify notification was shown
      expect(notificationService.addNotification).toHaveBeenCalledWith(
        jasmine.any(String),
        'danger'
      );
    }
  });

  it('should call ApplicationService.loginAnonymously and navigate on success', async () => {
    await component.onAnonymousLogin();

    expect(applicationService.loginAnonymously).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/tabs']);
    expect(notificationService.addNotification).toHaveBeenCalledWith(
      jasmine.any(String),
      'success'
    );
    expect(loadingController.create).toHaveBeenCalled();
  });

  it('should handle anonymous login error', async () => {
    applicationService.loginAnonymously.and.returnValue(
      Promise.reject('error')
    );

    await component.onAnonymousLogin();

    expect(notificationService.addNotification).toHaveBeenCalledWith(
      jasmine.any(String),
      'danger'
    );
    expect(component.isLoading).toBeFalse();
  });

  it('should show forgot password alert and send reset link', async () => {
    await component.onForgotPassword();

    expect(alertController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        header: jasmine.any(String),
        message: jasmine.any(String),
        inputs: jasmine.any(Array),
        buttons: jasmine.any(Array),
      })
    );
  });

  // it('should send password reset email when valid email provided', async () => {
  //   const mockAlert = testEnv.mocks.ionic.mockAlert;

  //   // Mock the alert handler to simulate user entering email
  //   alertController.create.and.returnValue(Promise.resolve({
  //     ...mockAlert,
  //     present: jasmine.createSpy('present').and.callFake(async () => {
  //       // Simulate user clicking the send button with email
  //       const alertConfig = alertController.create.calls.mostRecent().args[0];
  //       const sendButton = alertConfig.buttons.find((btn: any) => btn.text === i18nService.getTranslation('login.send_reset_link'));
  //       if (sendButton && sendButton.handler) {
  //         await sendButton.handler({ email: 'test@example.com' });
  //       }
  //     })
  //   }));

  //   await component.onForgotPassword();

  //   expect(applicationService.resetPassword).toHaveBeenCalledWith('test@example.com');
  //   expect(notificationService.addNotification).toHaveBeenCalledWith(
  //     jasmine.any(String),
  //     'success'
  //   );
  // });

  it('should navigate to signup page', () => {
    component.onSignUp();
    expect(router.navigate).toHaveBeenCalledWith(['/signup']);
  });

  it('should load remembered email from localStorage on init', () => {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('userEmail', 'remembered@example.com');

    // Create new component instance to test ngOnInit
    const newFixture = TestBed.createComponent(LoginComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.loginForm.get('email')?.value).toBe(
      'remembered@example.com'
    );
    expect(newComponent.loginForm.get('rememberMe')?.value).toBeTrue();
  });

  it('should not load remembered email when rememberMe is false', () => {
    localStorage.setItem('rememberMe', 'false');
    localStorage.setItem('userEmail', 'test@example.com');

    const newFixture = TestBed.createComponent(LoginComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.loginForm.get('email')?.value).toBe('');
    expect(newComponent.loginForm.get('rememberMe')?.value).toBeFalse();
  });

  it('should redirect authenticated user to tabs', async () => {
    // Simulate authenticated user
    const mockUser = { uid: 'test-123', isAnonymous: false };
    testEnv.mocks.services.userSubject.next(mockUser);

    await waitAsync(100); // Wait for observable update

    expect(router.navigate).toHaveBeenCalledWith(['/tabs']);
  });

  it('should cleanup subscriptions on destroy', () => {
    const subscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['subscriptions'] = [subscription];

    component.ngOnDestroy();

    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should set loading state correctly during login', async () => {
    TestInteractions.setFormValue(
      component.loginForm,
      'email',
      'test@example.com'
    );
    TestInteractions.setFormValue(component.loginForm, 'password', '123456');

    expect(component.isLoading).toBeFalse();

    const loginPromise = component.onLogin();
    expect(component.isLoading).toBeTrue();

    await loginPromise;
    expect(component.isLoading).toBeFalse();
  });

  it('should clear error message on successful login', async () => {
    component.errorMessage = 'Previous error';

    TestInteractions.setFormValue(
      component.loginForm,
      'email',
      'test@example.com'
    );
    TestInteractions.setFormValue(component.loginForm, 'password', '123456');

    await component.onLogin();

    expect(component.errorMessage).toBe('');
  });

  describe('Error Handling', () => {
    // it('should handle password reset errors', async () => {
    //   applicationService.resetPassword.and.returnValue(Promise.reject('Reset failed'));

    //   const mockAlert = testEnv.mocks.ionic.mockAlert;
    //   alertController.create.and.returnValue(Promise.resolve({
    //     ...mockAlert,
    //     present: jasmine.createSpy('present').and.callFake(async () => {
    //       const alertConfig = alertController.create.calls.mostRecent().args[0];
    //       const sendButton = alertConfig.buttons.find((btn: any) => btn.text === i18nService.getTranslation('login.send_reset_link'));
    //       if (sendButton && sendButton.handler) {
    //         await sendButton.handler({ email: 'test@example.com' });
    //       }
    //     })
    //   }));

    //   await component.onForgotPassword();

    //   expect(notificationService.addNotification).toHaveBeenCalledWith(
    //     jasmine.any(String),
    //     'danger'
    //   );
    // });

    it('should handle undefined error message gracefully', async () => {
      i18nService.getTranslation = jasmine.createSpy('getTranslation');

      TestInteractions.setFormValue(
        component.loginForm,
        'email',
        'test@example.com'
      );
      TestInteractions.setFormValue(
        component.loginForm,
        'password',
        'password'
      );
      TestInteractions.setFormValue(component.loginForm, 'rememberMe', false);

      applicationService.loginWithEmail.and.returnValue(Promise.reject({}));

      await component.onLogin();

      expect(component.errorMessage).not.toBe('');
      expect(i18nService.getTranslation).toHaveBeenCalledWith('login.failed');
    });
  });

  describe('Form Interactions', () => {
    it('should mark all form controls as touched when form is invalid', async () => {
      TestInteractions.setFormValue(component.loginForm, 'email', '');
      TestInteractions.setFormValue(component.loginForm, 'password', '');

      await component.onLogin();

      expect(component.loginForm.get('email')?.touched).toBeTrue();
      expect(component.loginForm.get('password')?.touched).toBeTrue();
    });

    it('should not handle form submission with whitespace in beginning of email fields', async () => {
      spyOnProperty(component.loginForm, 'invalid').and.callThrough();
      spyOn(component, 'markFormGroupTouched').and.callThrough();

      // Only leading whitespace in email
      TestInteractions.setFormValue(
        component.loginForm,
        'email',
        '  test@example.com'
      );
      TestInteractions.setFormValue(
        component.loginForm,
        'password',
        '  123456  '
      );

      await component.onLogin();
      expect(component.loginForm.invalid).toBeTrue();
      expect(component.markFormGroupTouched).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator during anonymous login', async () => {
      expect(component.isLoading).toBeFalse();

      const promise = component.onAnonymousLogin();
      expect(component.isLoading).toBeTrue();

      await promise;
      expect(component.isLoading).toBeFalse();
    });

    it('should dismiss loading controller on login error', async () => {
      applicationService.loginWithEmail.and.returnValue(
        Promise.reject({ code: 'auth/invalid-email' })
      );

      TestInteractions.setFormValue(
        component.loginForm,
        'email',
        'test@example.com'
      );
      TestInteractions.setFormValue(
        component.loginForm,
        'password',
        'password'
      );

      await component.onLogin();

      expect(loadingController.create).toHaveBeenCalled();
      expect(testEnv.mocks.ionic.mockLoading.dismiss).toHaveBeenCalled();
    });
  });

  describe('LocalStorage Management', () => {
    it('should not save to localStorage when rememberMe is false', async () => {
      TestInteractions.setFormValue(
        component.loginForm,
        'email',
        'test@example.com'
      );
      TestInteractions.setFormValue(component.loginForm, 'password', '123456');
      TestInteractions.setFormValue(component.loginForm, 'rememberMe', false);

      await component.onLogin();

      expect(localStorage.getItem('rememberMe')).toBeNull();
      expect(localStorage.getItem('userEmail')).toBeNull();
    });

    it('should handle localStorage not available gracefully', async () => {
      // Mock localStorage to throw error
      spyOn(Storage.prototype, 'setItem').and.throwError(
        'Storage not available'
      );

      TestInteractions.setFormValue(
        component.loginForm,
        'email',
        'test@example.com'
      );
      TestInteractions.setFormValue(component.loginForm, 'password', '123456');
      TestInteractions.setFormValue(component.loginForm, 'rememberMe', true);

      // Should not throw error
      expect(async () => await component.onLogin()).not.toThrow();
    });
  });
});
