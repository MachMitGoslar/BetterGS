import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { of, BehaviorSubject } from 'rxjs';

import { ProfileEditModalComponent } from './profile-edit-modal.component';
import {
  createTestingEnvironment,
  TestInteractions,
  MOCK_USER,
  MOCK_ANONYMOUS_USER,
  MOCK_PUBLIC_PROFILE,
} from 'src/testing/shared-testing-config';
import { ApplicationService } from '@services/application.service';
import { NotificationService } from '@services/notification.service';
import { User } from '@angular/fire/auth';
import { UserPublicProfile } from '@models/user_public_profile.model';
import { UserPrivateProfile } from '@models/user_private_profile.model';
import { IconService } from '@services/icon.service';
// Create a proper mock for UserPrivateProfile
const MOCK_PRIVATE_PROFILE: UserPrivateProfile = {
  email: 'test@example.com',
  role: 'user',
  needsOnboarding: false,
  toDB: jasmine.createSpy('toDB').and.returnValue({
    email: 'test@example.com',
    role: 'user',
  }),
} as UserPrivateProfile;

describe('ProfileEditModalComponent', () => {
  let component: ProfileEditModalComponent;
  let fixture: ComponentFixture<ProfileEditModalComponent>;
  let testEnv: any;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockApplicationService: jasmine.SpyObj<ApplicationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(waitForAsync(() => {
    testEnv = createTestingEnvironment();

    // Create spies for dependencies
    mockModalController = jasmine.createSpyObj('ModalController', [
      'dismiss',
      'onDidDismiss',
    ]);
    mockApplicationService = jasmine.createSpyObj('ApplicationService', [
      'registerUserWithEmail',
      'updateUserProfile',
      'changePassword',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'addNotification',
    ]);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        ProfileEditModalComponent,
      ],
      providers: [
        ...testEnv.providers,
        FormBuilder,
        { provide: ModalController, useValue: mockModalController },
        { provide: ApplicationService, useValue: mockApplicationService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: IconService },
      ],
    }).compileComponents();

    let iconService = TestBed.inject(IconService);
    fixture = TestBed.createComponent(ProfileEditModalComponent);
    component = fixture.componentInstance;
  }));

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form on ngOnInit', () => {
      component.ngOnInit();

      expect(component.profileForm).toBeDefined();
      expect(component.profileForm.get('displayName')).toBeTruthy();
      expect(component.profileForm.get('email')).toBeTruthy();
      expect(component.profileForm.get('currentPassword')).toBeTruthy();
      expect(component.profileForm.get('newPassword')).toBeTruthy();
      expect(component.profileForm.get('confirmPassword')).toBeTruthy();
    });

    it('should populate form with user data when user_obj is provided', () => {
      component.user_obj = {
        user: MOCK_USER as User,
        publicProfile: MOCK_PUBLIC_PROFILE as UserPublicProfile,
        privateProfile: MOCK_PRIVATE_PROFILE,
      };

      component.ngOnInit();

      expect(component.profileForm.get('displayName')?.value).toBe(
        MOCK_PUBLIC_PROFILE.name
      );
      expect(component.profileForm.get('email')?.value).toBe(MOCK_USER.email);
    });

    it('should disable email field for non-anonymous users', () => {
      component.user_obj = {
        user: { ...MOCK_USER, isAnonymous: false } as User,
        publicProfile: MOCK_PUBLIC_PROFILE as UserPublicProfile,
        privateProfile: MOCK_PRIVATE_PROFILE,
      };

      component.ngOnInit();

      expect(component.profileForm.get('email')?.disabled).toBe(true);
    });

    it('should keep email field enabled for anonymous users', () => {
      component.user_obj = {
        user: MOCK_ANONYMOUS_USER as User,
        publicProfile: MOCK_PUBLIC_PROFILE as UserPublicProfile,
        privateProfile: MOCK_PRIVATE_PROFILE,
      };

      component.ngOnInit();

      expect(component.profileForm.get('email')?.disabled).toBe(false);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should require display name with minimum length of 2', () => {
      const displayNameControl = component.profileForm.get('displayName');

      displayNameControl?.setValue('');
      expect(displayNameControl?.hasError('required')).toBe(true);

      displayNameControl?.setValue('A');
      expect(displayNameControl?.hasError('minlength')).toBe(true);

      displayNameControl?.setValue('AB');
      expect(displayNameControl?.valid).toBe(true);
    });

    it('should require valid email format', () => {
      component.user_obj = {
        user: { ...MOCK_USER, isAnonymous: true } as User,
        publicProfile: MOCK_PUBLIC_PROFILE as UserPublicProfile,
        privateProfile: MOCK_PRIVATE_PROFILE,
      };
      component.ngOnInit();
      const emailControl = component.profileForm.get('email');
      emailControl?.markAllAsTouched();
      emailControl?.patchValue('');

      expect(emailControl?.hasError('required')).toBe(true);
      emailControl?.patchValue('invalid-email');
      emailControl?.markAsTouched();
      console.log('Errors:', emailControl);

      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.patchValue('valid@example.com');
      expect(emailControl?.valid).toBe(true);
    });

    it('should require minimum length for new password', () => {
      const passwordControl = component.profileForm.get('newPassword');

      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);

      passwordControl?.setValue('123456');
      expect(passwordControl?.valid).toBe(true);
    });

    it('should detect password mismatch', () => {
      component.profileForm.patchValue({
        newPassword: 'password123',
        confirmPassword: 'password456',
      });

      // Trigger the password match check
      component['checkPasswordMatch']();

      expect(component.passwordMismatch).toBe(true);
    });

    it('should detect password match', () => {
      component.profileForm.patchValue({
        newPassword: 'password123',
        confirmPassword: 'password123',
      });

      // Trigger the password match check
      component['checkPasswordMatch']();

      expect(component.passwordMismatch).toBe(false);
    });
  });

  describe('Modal Actions', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should dismiss modal when closeModal is called', () => {
      component.closeModal();

      expect(mockModalController.dismiss).toHaveBeenCalled();
    });
  });

  describe('Profile Update - Anonymous User', () => {
    beforeEach(() => {
      component.user_obj = {
        user: MOCK_ANONYMOUS_USER as User,
        publicProfile: MOCK_PUBLIC_PROFILE as UserPublicProfile,
        privateProfile: MOCK_PRIVATE_PROFILE,
      };
      component.ngOnInit();
    });

    it('should register anonymous user with email and password', async () => {
      component.profileForm.patchValue({
        displayName: 'New User',
        email: 'newuser@example.com',
        newPassword: 'password123',
        confirmPassword: 'password123',
      });

      mockApplicationService.registerUserWithEmail.and.returnValue(
        Promise.resolve()
      );

      await component.updateProfile();

      expect(mockApplicationService.registerUserWithEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        'password123',
        'New User'
      );
      expect(mockModalController.dismiss).toHaveBeenCalled();
    });

    it('should handle registration error for anonymous user', async () => {
      component.profileForm.patchValue({
        displayName: 'New User',
        email: 'newuser@example.com',
        newPassword: 'password123',
        confirmPassword: 'password123',
      });

      const error = new Error('Registration failed');
      mockApplicationService.registerUserWithEmail.and.returnValue(
        Promise.reject(error)
      );

      await component.updateProfile();

      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        'Failed to register user. Please try again.',
        'danger'
      );
      expect(component.isLoading).toBe(false);
    });

    it('should not proceed with invalid form for anonymous user', async () => {
      component.profileForm.patchValue({
        displayName: '', // Invalid - required
        email: 'invalid-email', // Invalid format
        newPassword: '123', // Too short
      });

      await component.updateProfile();

      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        'Please fix the form errors before saving.',
        'danger'
      );
      expect(
        mockApplicationService.registerUserWithEmail
      ).not.toHaveBeenCalled();
    });
  });

  describe('Profile Update - Registered User', () => {
    beforeEach(() => {
      component.user_obj = {
        user: { ...MOCK_USER, isAnonymous: false } as User,
        publicProfile: MOCK_PUBLIC_PROFILE as UserPublicProfile,
        privateProfile: MOCK_PRIVATE_PROFILE,
      };
      component.ngOnInit();
    });

    it('should update display name when changed', async () => {
      const newDisplayName = 'Updated Name 2';
      component.profileForm.patchValue({
        displayName: newDisplayName,
      });

      mockApplicationService.updateUserProfile.and.returnValue(
        Promise.resolve()
      );

      await component.updateProfile();

      expect(component.user_obj!.publicProfile.name).toBe(newDisplayName);
      expect(mockApplicationService.updateUserProfile).toHaveBeenCalled();
      expect(mockModalController.dismiss).toHaveBeenCalled();
    });

    it('should change password when provided', async () => {
      component.profileForm.patchValue({
        displayName: MOCK_PUBLIC_PROFILE.name, // No change
        currentPassword: 'oldpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      mockApplicationService.changePassword.and.returnValue(Promise.resolve());

      await component.updateProfile();

      expect(mockApplicationService.changePassword).toHaveBeenCalledWith(
        'newpassword123',
        'oldpassword'
      );
      expect(mockModalController.dismiss).toHaveBeenCalled();
    });

    it('should handle invalid credential error', async () => {
      component.profileForm.patchValue({
        displayName: MOCK_PUBLIC_PROFILE.name,
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      const error = { code: 'auth/invalid-credential' };
      mockApplicationService.changePassword.and.returnValue(
        Promise.reject(error)
      );

      await component.updateProfile();

      expect(
        component.profileForm.get('currentPassword')?.hasError('incorrect')
      ).toBe(true);
      expect(mockModalController.dismiss).not.toHaveBeenCalled();
    });

    it('should handle general update errors', async () => {
      component.profileForm.patchValue({
        displayName: 'Updated Name',
      });
      component.user_obj = {
        user: { ...MOCK_USER, isAnonymous: false } as User,
        publicProfile: MOCK_PUBLIC_PROFILE as UserPublicProfile,
        privateProfile: MOCK_PRIVATE_PROFILE,
      };

      const error = new Error('Update failed');
      mockApplicationService.updateUserProfile.and.returnValue(
        Promise.reject(error)
      );

      await component.updateProfile();

      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        'Failed to update profile. Please try again.',
        'danger'
      );
      expect(component.isLoading).toBe(false);
    });

    it('should not proceed with invalid form for registered user', async () => {
      component.profileForm.patchValue({
        displayName: '', // Invalid - required
      });

      await component.updateProfile();

      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        'Please fix the form errors before saving.',
        'danger'
      );
      expect(mockApplicationService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should not proceed when passwords do not match', async () => {
      component.profileForm.patchValue({
        displayName: 'Valid Name',
        newPassword: 'password123',
        confirmPassword: 'different123',
      });
      component.passwordMismatch = true;

      await component.updateProfile();

      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        'Please fix the form errors before saving.',
        'danger'
      );
      expect(mockApplicationService.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should reset password mismatch flag', () => {
      component.passwordMismatch = true;

      component.resetForm();

      expect(component.passwordMismatch).toBe(false);
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      component.user_obj = {
        user: MOCK_ANONYMOUS_USER as User,
        publicProfile: MOCK_PUBLIC_PROFILE as UserPublicProfile,
        privateProfile: MOCK_PRIVATE_PROFILE,
      };
      component.ngOnInit();
    });

    it('should set loading state during profile update', async () => {
      component.profileForm.patchValue({
        displayName: 'New User',
        email: 'newuser@example.com',
        newPassword: 'password123',
        confirmPassword: 'password123',
      });

      // Mock a slow async operation
      mockApplicationService.registerUserWithEmail.and.returnValue(
        new Promise((resolve) => setTimeout(resolve, 100))
      );

      const updatePromise = component.updateProfile();

      expect(component.isLoading).toBe(true);

      await updatePromise;

      expect(component.isLoading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined user_obj gracefully', async () => {
      component.user_obj = undefined;
      component.ngOnInit();

      await component.updateProfile();

      expect(component.isLoading).toBe(false);
      expect(
        mockApplicationService.registerUserWithEmail
      ).not.toHaveBeenCalled();
      expect(mockApplicationService.updateUserProfile).not.toHaveBeenCalled();
    });

    it('should handle password clearing after successful update', async () => {
      component.user_obj = {
        user: { ...MOCK_USER, isAnonymous: false } as User,
        publicProfile: MOCK_PUBLIC_PROFILE as UserPublicProfile,
        privateProfile: MOCK_PRIVATE_PROFILE,
      };
      component.ngOnInit();

      component.profileForm.patchValue({
        displayName: MOCK_PUBLIC_PROFILE.name,
        currentPassword: 'currentpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      });

      mockApplicationService.changePassword.and.returnValue(Promise.resolve());

      await component.updateProfile();

      expect(component.profileForm.get('currentPassword')?.value).toBe('');
      expect(component.profileForm.get('newPassword')?.value).toBe('');
      expect(component.profileForm.get('confirmPassword')?.value).toBe('');
    });
  });
});
