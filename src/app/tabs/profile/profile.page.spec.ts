import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, BehaviorSubject } from 'rxjs';
import { Platform, AlertController, ActionSheetController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { ProfilePage } from './profile.page';
import { ApplicationService } from 'src/app/core/services/application.service';
import { UserService } from 'src/app/core/services/user.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { I18nService } from 'src/app/core/services/i18n.service';
import { UserPublicProfile } from 'src/app/core/models/user_public_profile.model';
import { UserPrivateProfile } from 'src/app/core/models/user_private_profile.model';
import { User } from '@angular/fire/auth';
import { createTestingEnvironment, MOCK_USER, MOCK_PUBLIC_PROFILE, MOCK_PRIVATE_PROFILE } from '../../../testing/shared-testing-config';

/**
 * Test Suite for ProfilePage Component
 * 
 * Comprehensive tests covering:
 * - Component initialization and lifecycle
 * - Form validation and management
 * - Profile data loading and updating
 * - Image upload functionality
 * - Account management
 * - Error handling and edge cases
 * - Memory management and cleanup
 */
describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  
  // Service mocks
  let mockApplicationService: any;
  let mockUserService: any;
  let mockNotificationService: any;
  let mockI18nService: any;
  let mockPlatform: any;
  let mockRouter: any;
  let mockAlertController: any;
  let mockActionSheetController: any;
  
  // Observable subjects
  let userSubject: BehaviorSubject<any>;
  let publicProfileSubject: BehaviorSubject<any>;
  let privateProfileSubject: BehaviorSubject<any>;

  // Mock data
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    isAnonymous: false,
    emailVerified: true
  } as User;

  const mockPublicProfile = {
    id: 'profile-id',
    name: 'Test User',
    profilePictureUrl: 'https://example.com/avatar.jpg',
    createdAt: new Date('2024-01-01'),
    trackedTime: 0,
    trackedActivities: 0,
    total_trackings: 0,
    isActive: true,
    toDB: () => ({
      name: 'Test User',
      profilePictureUrl: 'https://example.com/avatar.jpg'
    }) 
  } as UserPublicProfile ;

  const mockPrivateProfile = {
    id: 'private-id',
    email: 'test@example.com',
    role: 'user',
    needsOnboarding: false,
    toDB: () => ({
      id: 'private-id',
      email: 'test@example.com',
      role: 'user',
      needsOnboarding: false
    }) 
  } as UserPrivateProfile;
  beforeEach(async () => {
    // Setup $localize for Angular i18n
    (globalThis as any).$localize = (template: TemplateStringsArray, ...expressions: any[]) => {
      let result = template[0];
      for (let i = 0; i < expressions.length; i++) {
        result += expressions[i] + template[i + 1];
      }
      return result;
    };

    // Create comprehensive testing environment
    const testEnv = createTestingEnvironment({
      initialData: {
        'users/test-uid-123/public': MOCK_PUBLIC_PROFILE,
        'users/test-uid-123/private': MOCK_PRIVATE_PROFILE
      }
    });

    // Get references to the created subjects and mocks
    userSubject = testEnv.mocks.services.userSubject;
    publicProfileSubject = testEnv.mocks.services.publicProfileSubject;
    privateProfileSubject = testEnv.mocks.services.privateProfileSubject;
    
    mockApplicationService = testEnv.mocks.services.mockApplicationService;
    mockUserService = testEnv.mocks.services.mockUserService;
    mockNotificationService = testEnv.mocks.services.mockNotificationService;
    mockI18nService = testEnv.mocks.services.mockI18nService;
    mockPlatform = testEnv.mocks.ionic.mockPlatform;
    mockRouter = testEnv.mocks.ionic.mockRouter;
    mockAlertController = testEnv.mocks.ionic.mockAlertController;
    mockActionSheetController = testEnv.mocks.ionic.mockActionSheetController;

    await TestBed.configureTestingModule({
      imports: [
        ProfilePage,
        ReactiveFormsModule
      ],
      providers: [
        FormBuilder,
        ...testEnv.providers,
        // Override services to ensure our mocks are used
        { provide: ApplicationService, useValue: mockApplicationService },
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: Platform, useValue: mockPlatform },
        { provide: Router, useValue: mockRouter },
        { provide: AlertController, useValue: mockAlertController },
        { provide: ActionSheetController, useValue: mockActionSheetController }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ==========================================
  // Component Initialization Tests
  // ==========================================

  describe('Component Initialization', () => {
    it('should create component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.user).toBeNull();
      expect(component.isLoading).toBeFalse();
      expect(component.passwordMismatch).toBeFalse();
      expect(component._publicUserData).toBeUndefined();
      expect(component._privateUserData).toBeUndefined();
    });

    it('should initialize reactive form with correct structure', () => {
      expect(component.profileForm).toBeDefined();
      expect(component.profileForm.get('displayName')).toBeDefined();
      expect(component.profileForm.get('email')).toBeDefined();
      expect(component.profileForm.get('currentPassword')).toBeDefined();
      expect(component.profileForm.get('newPassword')).toBeDefined();
      expect(component.profileForm.get('confirmPassword')).toBeDefined();
    });

    it('should set up form validators correctly', () => {
      const form = component.profileForm;
      
      // Test displayName validators
      form.get('displayName')?.setValue('a'); // Too short
      expect(form.get('displayName')?.hasError('minlength')).toBeTruthy();
      
      form.get('displayName')?.setValue(''); // Required
      expect(form.get('displayName')?.hasError('required')).toBeTruthy();
      
      // Test email validators
      form.get('email')?.setValue('invalid-email');
      expect(form.get('email')?.hasError('email')).toBeTruthy();
      
      form.get('email')?.setValue('');
      expect(form.get('email')?.hasError('required')).toBeTruthy();
      
      // Test password validators
      form.get('newPassword')?.setValue('12345'); // Too short
      expect(form.get('newPassword')?.hasError('minlength')).toBeTruthy();
    });
  });

  // ==========================================
  // Lifecycle Method Tests
  // ==========================================

  describe('Lifecycle Methods', () => {
    describe('ngOnInit', () => {
      it('should set up user observable', () => {
        component.ngOnInit();
        expect(component.$user).toBe(mockApplicationService.$currentUser);
      });

      it('should load user profile data', () => {
        spyOn(component as any, 'loadUserProfile');
        component.ngOnInit();
        expect((component as any).loadUserProfile).toHaveBeenCalled();
      });
    });

    describe('ngOnDestroy', () => {
      it('should unsubscribe from all subscriptions', () => {
        const mockSubscription1 = jasmine.createSpyObj('Subscription', ['unsubscribe']);
        const mockSubscription2 = jasmine.createSpyObj('Subscription', ['unsubscribe']);
        
        (component as any).subscriptions = [mockSubscription1, mockSubscription2];
        
        component.ngOnDestroy();
        
        expect(mockSubscription1.unsubscribe).toHaveBeenCalled();
        expect(mockSubscription2.unsubscribe).toHaveBeenCalled();
      });
    });
  });

  // ==========================================
  // Data Loading Tests
  // ==========================================

  describe('Data Loading', () => {
    describe('loadUserProfile', () => {
      beforeEach(() => {
        component.ngOnInit();
      });

      it('should subscribe to user authentication state', fakeAsync(() => {
        userSubject.next(mockUser);
        tick();
        
        expect(component.user).toBe(mockUser);
      }));

      it('should subscribe to public profile data', fakeAsync(() => {
        publicProfileSubject.next(mockPublicProfile);
        tick();
        
        expect(component._publicUserData).toBe(mockPublicProfile);
      }));

      it('should subscribe to private profile data', fakeAsync(() => {
        privateProfileSubject.next(mockPrivateProfile);
        tick();
        
        expect(component._privateUserData).toBe(mockPrivateProfile);
      }));

      it('should populate form when user data is loaded', fakeAsync(() => {
        spyOn(component as any, 'populateForm');
        
        userSubject.next(mockUser);
        tick();
        
        expect((component as any).populateForm).toHaveBeenCalled();
      }));
    });

    describe('populateForm', () => {
      beforeEach(() => {
        component.user = mockUser;
        component._publicUserData = mockPublicProfile as any;
        component._privateUserData = mockPrivateProfile as any;
      });

      it('should populate form with user data', () => {
        (component as any).populateForm();
        
        expect(component.profileForm.get('displayName')?.value).toBe(mockPublicProfile.name);
        expect(component.profileForm.get('email')?.value).toBe(mockUser.email);
      });

      it('should use private profile email if user email is not available', () => {
        component.user = { ...mockUser, email: null };
        
        (component as any).populateForm();
        
        expect(component.profileForm.get('email')?.value).toBe(mockPrivateProfile.email);
      });

      it('should handle missing user data gracefully', () => {
        component.user = null;
        
        expect(() => (component as any).populateForm()).not.toThrow();
      });
    });
  });

  // ==========================================
  // Form Validation Tests
  // ==========================================

  describe('Form Validation', () => {
    describe('checkPasswordMatch', () => {
      it('should set passwordMismatch to true when passwords do not match', () => {
        component.profileForm.patchValue({
          newPassword: 'password123',
          confirmPassword: 'password456'
        });
        
        (component as any).checkPasswordMatch();
        
        expect(component.passwordMismatch).toBeTruthy();
      });

      it('should set passwordMismatch to false when passwords match', () => {
        component.profileForm.patchValue({
          newPassword: 'password123',
          confirmPassword: 'password123'
        });
        
        (component as any).checkPasswordMatch();
        
        expect(component.passwordMismatch).toBeFalsy();
      });

      it('should set passwordMismatch to false when either field is empty', () => {
        component.profileForm.patchValue({
          newPassword: 'password123',
          confirmPassword: ''
        });
        
        (component as any).checkPasswordMatch();
        
        expect(component.passwordMismatch).toBeFalsy();
      });
    });
  });

  // ==========================================
  // Profile Update Tests
  // ==========================================

  describe('Profile Update', () => {
    beforeEach(() => {
      component.user = mockUser;
      component._publicUserData = mockPublicProfile as any;
      component._privateUserData = mockPrivateProfile as any;
      
      component.profileForm.patchValue({
        displayName: 'Updated Name',
        email: 'updated@example.com',
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });
    });

    describe('updateProfile', () => {
      it('should show error notification for invalid form', async () => {
        component.profileForm.patchValue({ displayName: '' }); // Invalid
        
        await component.updateProfile();
        
        expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
          'Please fix the form errors before saving.',
          'danger'
        );
      });

      it('should show error notification for password mismatch', async () => {
        component.passwordMismatch = true;
        
        await component.updateProfile();
        
        expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
          'Please fix the form errors before saving.',
          'danger'
        );
      });

      it('should show error notification when user data is missing', async () => {
        component.user = null;
        
        await component.updateProfile();
        
        expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
          'User data not available. Please try again.',
          'danger'
        );
      });

      it('should update public profile when display name changes', async () => {
        // Set the initial value to something different than the new value
        component._publicUserData!.name = 'Old Name';
        component.profileForm.patchValue({ displayName: 'New Name' });
        
        await component.updateProfile();
        
        expect(component._publicUserData?.name).toBe('New Name');
        expect(mockApplicationService.updateUserProfile).toHaveBeenCalled();
      });

      it('should register anonymous user with email and password', async () => {
        component.user = { ...mockUser, isAnonymous: true };
        
        await component.updateProfile();
        
        expect(mockApplicationService.registerUserWithEmail).toHaveBeenCalledWith(
          'updated@example.com',
          'newpass123'
        );
      });

      it('should change password for authenticated users', async () => {
        await component.updateProfile();
        
        expect(mockApplicationService.changePassword).toHaveBeenCalledWith('newpass123');
      });

      it('should clear sensitive form fields after successful update', async () => {
        await component.updateProfile();
        
        expect(component.profileForm.get('currentPassword')?.value).toBe('');
        expect(component.profileForm.get('newPassword')?.value).toBe('');
        expect(component.profileForm.get('confirmPassword')?.value).toBe('');
      });

      it('should show success notification on successful update', async () => {
        await component.updateProfile();
        
        expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
          'Profile updated successfully!',
          'success'
        );
      });

      it('should handle update errors gracefully', async () => {
        // Set up a scenario where updateUserProfile will be called and fail
        component.profileForm.patchValue({
          displayName: 'New Name',
          email: 'test@example.com'
        });
        
        mockApplicationService.updateUserProfile.and.returnValue(Promise.reject(new Error('Update failed')));
        
        await component.updateProfile();
        
        expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
          'Failed to update profile. Please try again.',
          'danger'
        );
        expect(component.isLoading).toBeFalsy();
      });
    });

    describe('resetForm', () => {
      it('should reload user profile data', () => {
        spyOn(component as any, 'loadUserProfile');
        
        component.resetForm();
        
        expect((component as any).loadUserProfile).toHaveBeenCalled();
      });

      it('should reset password mismatch flag', () => {
        component.passwordMismatch = true;
        
        component.resetForm();
        
        expect(component.passwordMismatch).toBeFalsy();
      });
    });
  });

  // ==========================================
  // Image Management Tests
  // ==========================================

  describe('Image Management', () => {
    describe('changeProfilePicture', () => {
      it('should show mobile options when on mobile platform', async () => {
        mockPlatform.is.and.returnValue(true);
        
        await component.changeProfilePicture();
        
        expect(mockActionSheetController.create).toHaveBeenCalledWith(
          jasmine.objectContaining({
            header: 'profile.changePicture',
            buttons: jasmine.arrayContaining([
              jasmine.objectContaining({ icon: 'camera' }),
              jasmine.objectContaining({ icon: 'images' })
            ])
          })
        );
      });

      it('should show desktop options when not on mobile platform', async () => {
        mockPlatform.is.and.returnValue(false);
        
        await component.changeProfilePicture();
        
        expect(mockActionSheetController.create).toHaveBeenCalledWith(
          jasmine.objectContaining({
            buttons: jasmine.arrayContaining([
              jasmine.objectContaining({ icon: 'images' }) // Upload option
            ])
          })
        );
      });
    });

    describe('processImageUpload', () => {
      const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4w';
      const mockFileName = 'test.jpg';
      const mockFileType = 'image/jpeg';

      beforeEach(() => {
        component.user = mockUser;
        component._publicUserData = mockPublicProfile as any;
      });

      it('should validate image type before upload', async () => {
        spyOn(component as any, 'isValidImageType').and.returnValue(false);
        
        await (component as any).processImageUpload(mockBase64, mockFileName, 'invalid/type');
        
        expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
          'profile.error.invalidFileType',
          'danger'
        );
      });

      it('should validate image size before upload', async () => {
        spyOn(component as any, 'isValidImageType').and.returnValue(true);
        spyOn(component as any, 'isValidImageSize').and.returnValue(false);
        
        await (component as any).processImageUpload(mockBase64, mockFileName, mockFileType);
        
        expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
          'profile.error.fileTooLarge',
          'danger'
        );
      });

      it('should upload image and update profile on success', async () => {
        spyOn(component as any, 'isValidImageType').and.returnValue(true);
        spyOn(component as any, 'isValidImageSize').and.returnValue(true);
        
        const mockImageUrl = 'https://example.com/uploaded-image.jpg';
        mockApplicationService.uploadUserProfileImage.and.returnValue(Promise.resolve(mockImageUrl));
        
        await (component as any).processImageUpload(mockBase64, mockFileName, mockFileType);
        
        expect(mockApplicationService.uploadUserProfileImage).toHaveBeenCalledWith(
          mockBase64,
          mockFileName,
          jasmine.objectContaining({
            contentType: mockFileType,
            customMetadata: jasmine.objectContaining({
              originalName: mockFileName
            })
          })
        );
        
        expect(component._publicUserData?.profilePictureUrl).toBe(mockImageUrl);
        expect(mockApplicationService.updateUserProfile).toHaveBeenCalled();
      });
    });

    describe('removeProfilePicture', () => {
      beforeEach(() => {
        component.user = mockUser;
        component._publicUserData = mockPublicProfile as any;
      });

      it('should update profile to remove picture URL', async () => {
        await (component as any).removeProfilePicture();
        
        expect(mockApplicationService.updateUserProfile).toHaveBeenCalledWith({
          name: mockPublicProfile.name,
          profilePictureUrl: undefined
        });
      });

      it('should show success notification on removal', async () => {
        await (component as any).removeProfilePicture();
        
        expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
          'Profile picture removed',
          'success'
        );
      });
    });
  });

  // ==========================================
  // Validation Utility Tests
  // ==========================================

  describe('Validation Utilities', () => {
    describe('isValidImageType', () => {
      it('should return true for valid image types', () => {
        expect((component as any).isValidImageType('image/jpeg')).toBeTruthy();
        expect((component as any).isValidImageType('image/png')).toBeTruthy();
        expect((component as any).isValidImageType('image/gif')).toBeTruthy();
        expect((component as any).isValidImageType('image/webp')).toBeTruthy();
      });

      it('should return false for invalid image types', () => {
        expect((component as any).isValidImageType('text/plain')).toBeFalsy();
        expect((component as any).isValidImageType('application/pdf')).toBeFalsy();
        expect((component as any).isValidImageType('video/mp4')).toBeFalsy();
      });

      it('should handle case insensitive types', () => {
        expect((component as any).isValidImageType('IMAGE/JPEG')).toBeTruthy();
        expect((component as any).isValidImageType('Image/PNG')).toBeTruthy();
      });
    });

    describe('isValidImageSize', () => {
      it('should return true for images within size limit', () => {
        const smallBase64 = 'data:image/jpeg;base64,' + 'a'.repeat(1000);
        expect((component as any).isValidImageSize(smallBase64)).toBeTruthy();
      });

      it('should return false for images exceeding size limit', () => {
        const largeBase64 = 'data:image/jpeg;base64,' + 'a'.repeat(8000000); // ~8MB
        expect((component as any).isValidImageSize(largeBase64)).toBeFalsy();
      });
    });
  });

  // ==========================================
  // Account Management Tests
  // ==========================================

  describe('Account Management', () => {
    describe('logout', () => {
      it('should show confirmation alert', async () => {
        await component.logout();
        
        expect(mockAlertController.create).toHaveBeenCalledWith(
          jasmine.objectContaining({
            header: 'Logout',
            message: 'Are you sure you want to logout?'
          })
        );
      });
    });

    describe('confirmDeleteAccount', () => {
      it('should show confirmation alert with warning', async () => {
        await component.confirmDeleteAccount();
        
        expect(mockAlertController.create).toHaveBeenCalledWith(
          jasmine.objectContaining({
            header: 'Delete Account',
            message: jasmine.stringContaining('permanently lost')
          })
        );
      });
    });
  });

  // ==========================================
  // Utility Methods Tests
  // ==========================================

  describe('Utility Methods', () => {
    describe('getDaysSinceMember', () => {
      it('should return 0 when no public profile data', () => {
        component._publicUserData = undefined;
        
        expect(component.getDaysSinceMember()).toBe(0);
      });

      it('should return 0 when no creation date', () => {
        component._publicUserData = { ...mockPublicProfile, createdAt: undefined } as any;
        
        expect(component.getDaysSinceMember()).toBe(0);
      });

      it('should calculate days correctly', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10); // 10 days ago
        
        component._publicUserData = { 
          ...mockPublicProfile, 
          createdAt: pastDate,
          toDB: jasmine.createSpy('toDB')
        } as any;
        
        expect(component.getDaysSinceMember()).toBe(10);
      });
    });

    describe('days_active getter', () => {
      it('should return same value as getDaysSinceMember', () => {
        spyOn(component, 'getDaysSinceMember').and.returnValue(15);
        
        expect(component.days_active).toBe(15);
        expect(component.getDaysSinceMember).toHaveBeenCalled();
      });
    });
  });

  // ==========================================
  // Integration Tests
  // ==========================================

  describe('Integration Tests', () => {
    it('should handle complete profile update workflow', fakeAsync(() => {
      // Setup initial state
      component.ngOnInit();
      userSubject.next(mockUser);
      publicProfileSubject.next(mockPublicProfile);
      privateProfileSubject.next(mockPrivateProfile);
      tick();
      
      // Verify form is populated
      expect(component.profileForm.get('displayName')?.value).toBe(mockPublicProfile.name);
      
      // Simulate form changes
      component.profileForm.patchValue({
        displayName: 'Updated Name',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });
      
      // Verify password validation
      expect(component.passwordMismatch).toBeFalsy();
      
      // Perform update
      component.updateProfile();
      tick();
      
      // Verify success
      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        'Profile updated successfully!',
        'success'
      );
    }));

    it('should handle form validation errors throughout workflow', () => {
      // Set invalid form data
      component.profileForm.patchValue({
        displayName: '', // Invalid - required
        email: 'invalid-email', // Invalid - email format
        newPassword: '123', // Invalid - too short
        confirmPassword: '456' // Invalid - doesn't match
      });
      
      // Verify form is invalid
      expect(component.profileForm.invalid).toBeTruthy();
      expect(component.passwordMismatch).toBeTruthy();
      
      // Attempt update
      component.updateProfile();
      
      // Verify error notification
      expect(mockNotificationService.addNotification).toHaveBeenCalledWith(
        'Please fix the form errors before saving.',
        'danger'
      );
    });

    it('should handle memory cleanup properly', () => {
      component.ngOnInit();
      
      // Verify subscriptions are created
      expect((component as any).subscriptions.length).toBeGreaterThan(0);
      
      // Add spies to the unsubscribe methods
      (component as any).subscriptions.forEach((sub: any) => {
        spyOn(sub, 'unsubscribe');
      });
      
      // Destroy component
      component.ngOnDestroy();
      
      // Verify all subscriptions are cleaned up
      (component as any).subscriptions.forEach((sub: any) => {
        expect(sub.unsubscribe).toHaveBeenCalled();
      });
    });
  });
});
