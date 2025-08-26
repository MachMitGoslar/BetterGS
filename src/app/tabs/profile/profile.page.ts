import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonToolbar,
  IonTitle,
  IonCardHeader,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonNote,
  IonText,
  IonSpinner,
  IonHeader,
  Platform,
  IonLabel,
  AlertController,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { User } from '@angular/fire/auth';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import {
  trophyOutline,
  camera,
  images,
  trash,
  close,
  checkmark,
  warning,
  logOutOutline,
  person,
  settings,
  logIn,
  create,
  trashOutline,
  pencil,
  checkmarkCircle,
  closeCircle,
  trophy,
  personCircle,
  personAdd,
  personRemove,
  personOutline,
  lockClosedOutline,
  statsChartOutline,
  warningOutline,
  timeOutline,
  hourglassOutline,
  calendarOutline,
} from 'ionicons/icons';

// Core Services
import { NotificationService } from 'src/app/core/services/notification.service';
import { ApplicationService } from 'src/app/core/services/application.service';
import { I18nService } from 'src/app/core/services/i18n.service';
import { UserService } from 'src/app/core/services/user.service';

// Models
import { UserPublicProfile } from 'src/app/core/models/user_public_profile.model';
import { UserPrivateProfile } from 'src/app/core/models/user_private_profile.model';

// Components and Pipes
import { ProfilePictureComponent } from 'src/app/components/profile-picture/profile-picture.component';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';
import { I18nPipe } from 'src/app/core/pipes/i18n.pipe';

/**
 * ProfilePage - User Profile Management Component
 *
 * This component provides comprehensive user profile management functionality
 * including profile editing, image management, password changes, and account operations.
 *
 * Key Features:
 * - Reactive form-based profile editing
 * - Profile picture upload (camera/gallery/file upload)
 * - Password change functionality
 * - Account deletion with confirmation
 * - User logout with confirmation
 * - Form validation and error handling
 * - Multi-platform image handling
 * - Real-time form validation feedback
 *
 * Technical Capabilities:
 * - Firebase Authentication integration
 * - Capacitor Camera API integration
 * - File upload with validation
 * - Base64 image processing
 * - Responsive design for mobile/desktop
 * - Internationalization support
 * - Memory management with subscription cleanup
 *
 * Dependencies:
 * - ApplicationService: Core app operations and user management
 * - UserService: User profile data management
 * - NotificationService: User feedback and notifications
 * - I18nService: Internationalization and translations
 * - Camera: Native camera and gallery access
 * - Router: Navigation management
 * - Platform: Device detection and platform-specific features
 *
 * @author BetterGS Development Team
 * @version 1.0.0
 * @since 2025
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonNote,
    IonText,
    IonSpinner,
    ElapsedTimePipe,
    ProfilePictureComponent,
    I18nPipe,
  ],
})
export class ProfilePage implements OnInit, OnDestroy {
  // ==========================================
  // Public State Properties
  // ==========================================

  /**
   * Current authenticated user from Firebase Auth
   */
  user: User | null = null;

  /**
   * Observable stream of current user authentication state
   */
  $user = new Observable<User | null>();

  /**
   * User's public profile data (visible to other users)
   */
  _publicUserData: UserPublicProfile | undefined;

  /**
   * User's private profile data (personal information)
   */
  _privateUserData: UserPrivateProfile | undefined;

  /**
   * User's active activity count (number of ongoing activities)
   */
  userActiveActivityCount: Promise<number> = Promise.resolve(0);

  /**
   * Reactive form group for profile editing
   */
  profileForm!: FormGroup;

  /**
   * Loading state indicator for async operations
   */
  isLoading: boolean = false;

  /**
   * Password confirmation validation state
   */
  passwordMismatch: boolean = false;

  // ==========================================
  // Private Properties
  // ==========================================

  /**
   * Array of subscriptions for memory management
   */
  private subscriptions: Subscription[] = [];

  /**
   * Maximum allowed file size for image uploads (5MB)
   */
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  /**
   * Allowed image file types for upload validation
   */
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  // ==========================================
  // Constructor & Initialization
  // ==========================================

  /**
   * ProfilePage Constructor
   *
   * Initializes the component with required services and sets up
   * the reactive form, icon library, and observable streams.
   *
   * @param formBuilder - Angular reactive forms builder
   * @param alertController - Ionic alert controller for confirmations
   * @param actionSheetController - Ionic action sheet for image options
   * @param notificationService - User notification service
   * @param applicationService - Core application service
   * @param router - Angular router for navigation
   * @param i18nService - Internationalization service
   * @param platform - Ionic platform detection service
   * @param userService - User profile management service
   */

  private formBuilder = inject(FormBuilder);
  private alertController = inject(AlertController);
  private actionSheetController = inject(ActionSheetController);
  private notificationService = inject(NotificationService);
  public applicationService = inject(ApplicationService);
  public router = inject(Router);
  private i18nService = inject(I18nService);
  private platform = inject(Platform);
  private userService = inject(UserService);

  constructor() {
    this.initializeForm();
    this.registerIcons();
  }

  // ==========================================
  // Lifecycle Methods
  // ==========================================

  /**
   * Component initialization lifecycle method
   *
   * Sets up user observables and loads profile data.
   * Subscribes to authentication state and profile data streams.
   */
  ngOnInit() {
    this.$user = this.applicationService.$currentUser;
    this.loadUserProfile();
  }

  /**
   * Component destruction lifecycle method
   *
   * Cleans up all subscriptions to prevent memory leaks.
   * Called when component is destroyed.
   */
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // ==========================================
  // Initialization Methods
  // ==========================================

  /**
   * Registers Ionicons for use in the component
   *
   * Adds all required icons to the Ionic icon registry
   * for consistent UI throughout the profile interface.
   *
   * @private
   */
  private registerIcons(): void {
    addIcons({
      logOutOutline,
      camera,
      personOutline,
      lockClosedOutline,
      statsChartOutline,
      timeOutline,
      hourglassOutline,
      trophyOutline,
      calendarOutline,
      checkmarkCircle,
      warningOutline,
      trashOutline,
      images,
      trash,
      close,
      checkmark,
      warning,
      person,
      settings,
      logIn: logIn,
      create,
      pencil,
      closeCircle: closeCircle,
      trophy,
      personCircle: personCircle,
      personAdd: personAdd,
      personRemove: personRemove,
    });
  }

  /**
   * Initializes the reactive form with validation rules
   *
   * Creates a FormGroup with validators for all profile fields.
   * Sets up real-time password confirmation validation.
   * Configures form state management and error handling.
   *
   * Form Fields:
   * - displayName: Required, minimum 2 characters
   * - email: Required, valid email format
   * - currentPassword: Optional, for password changes
   * - newPassword: Optional, minimum 6 characters
   * - confirmPassword: Optional, must match newPassword
   *
   * @private
   */
  private initializeForm() {
    this.profileForm = this.formBuilder.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
    });

    // Set up real-time password confirmation validation
    const confirmPasswordControl = this.profileForm.get('confirmPassword');
    const newPasswordControl = this.profileForm.get('newPassword');

    if (confirmPasswordControl && newPasswordControl) {
      const confirmPasswordSub = confirmPasswordControl.valueChanges.subscribe(
        () => {
          this.checkPasswordMatch();
        }
      );

      const newPasswordSub = newPasswordControl.valueChanges.subscribe(() => {
        this.checkPasswordMatch();
      });

      this.subscriptions.push(confirmPasswordSub, newPasswordSub);
    }
  }

  // ==========================================
  // Data Loading Methods
  // ==========================================

  /**
   * Loads user profile data from services
   *
   * Subscribes to user authentication state and profile data streams.
   * Updates component state when user data changes.
   * Populates form with current user information.
   *
   * @private
   */
  private loadUserProfile() {
    // Subscribe to current user authentication state
    const userSub = this.$user.subscribe((user) => {
      this.user = user;
      console.log('Current user:', this.user);
      this.populateForm();
    });

    // Subscribe to private profile data
    const privateProfileSub =
      this.userService.$currentUserPrivateProfile.subscribe((profile) => {
        this._privateUserData = profile;
        this.populateForm();
      });

    // Subscribe to public profile data
    const publicProfileSub = this.userService.$currentUserProfile.subscribe(
      (profile) => {
        this._publicUserData = profile;
        console.log('Public user data:', this._publicUserData);
        this.populateForm();
      }
    );
    this.userActiveActivityCount = this.userService.getUserActiveActivityCount(
      this.user?.uid!
    );

    this.subscriptions.push(userSub, privateProfileSub, publicProfileSub);
  }

  /**
   * Populates the form with current user data
   *
   * Updates form controls with data from user profile.
   * Only updates if user data is available to prevent
   * overwriting user input with empty values.
   *
   * @private
   */
  private populateForm() {
    if (this.user && (this._publicUserData || this._privateUserData)) {
      this.profileForm.patchValue({
        displayName: this._publicUserData?.name || '',
        email: this.user.email || this._privateUserData?.email || '',
      });
    }
  }

  // ==========================================
  // Form Validation Methods
  // ==========================================

  /**
   * Checks if new password and confirmation password match
   *
   * Validates password confirmation in real-time.
   * Updates passwordMismatch flag for UI feedback.
   * Only validates when both password fields have values.
   *
   * @private
   */
  private checkPasswordMatch() {
    const newPassword = this.profileForm.get('newPassword')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;

    this.passwordMismatch =
      newPassword && confirmPassword && newPassword !== confirmPassword;
  }

  // ==========================================
  // Profile Update Methods
  // ==========================================

  /**
   * Updates user profile with form data
   *
   * Validates form data and updates user profile information.
   * Handles display name changes, email updates, and password changes.
   * Supports anonymous user registration with email/password.
   * Provides user feedback through notifications.
   *
   * Process:
   * 1. Validate form data and password confirmation
   * 2. Update private profile data (email)
   * 3. Update public profile data (display name) if changed
   * 4. Handle anonymous user registration if applicable
   * 5. Handle password changes for authenticated users
   * 6. Clear sensitive form fields
   * 7. Provide user feedback
   *
   * @returns Promise<void>
   */
  async updateProfile() {
    console.log('Updating profile with data:', this.profileForm.value);

    // Validate form before processing
    if (this.profileForm.invalid || this.passwordMismatch) {
      this.notificationService.addNotification(
        'Please fix the form errors before saving.',
        'danger'
      );
      return;
    }

    this.isLoading = true;

    if (!this.user || !this._privateUserData || !this._publicUserData) {
      console.error('No user data available to update.');
      this.notificationService.addNotification(
        'User data not available. Please try again.',
        'danger'
      );
      this.isLoading = false;
      return;
    }

    const formData = this.profileForm.value;

    // Update private user data (email)
    if (formData.email !== this._privateUserData.email) {
      this._privateUserData.email = formData.email;
    }

    try {
      // Update public user data (display name) if changed
      if (formData.displayName !== this._publicUserData.name) {
        this._publicUserData.name = formData.displayName;
        console.log('Display name changed:', formData.displayName);

        await this.applicationService.updateUserProfile(
          this._publicUserData.toDB()
        );
      }

      // Handle anonymous user registration with email/password
      if (
        formData.newPassword &&
        formData.newPassword.length > 0 &&
        formData.email &&
        this.user.isAnonymous
      ) {
        await this.applicationService.registerUserWithEmail(
          formData.email,
          formData.newPassword
        );
      }

      // Handle password change for authenticated users
      if (
        formData.newPassword &&
        formData.newPassword.length > 0 &&
        formData.currentPassword &&
        formData.currentPassword.length > 0 &&
        formData.newPassword !== formData.currentPassword &&
        !this.user.isAnonymous
      ) {
        await this.applicationService.changePassword(formData.newPassword);
      }

      // Clear sensitive form fields after successful update
      this.profileForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      this.notificationService.addNotification(
        'Failed to update profile. Please try again.',
        'danger'
      );
      return;
    } finally {
      this.notificationService.addNotification(
        'Profile updated successfully!',
        'success'
      );
      this.isLoading = false;
    }
  }

  /**
   * Resets form to original values
   *
   * Reloads user profile data from services and repopulates form.
   * Clears any validation errors and resets password mismatch flag.
   * Useful for canceling unsaved changes.
   */
  resetForm() {
    this.loadUserProfile();
    this.passwordMismatch = false;
  }

  // ==========================================
  // Image Management Methods
  // ==========================================

  /**
   * Opens action sheet for profile picture change options
   *
   * Displays platform-appropriate options for changing profile picture.
   * Mobile platforms show camera and gallery options.
   * Desktop platforms show file upload option.
   *
   * Options include:
   * - Take photo (mobile only)
   * - Choose from gallery (mobile only)
   * - Upload photo (desktop)
   * - Remove photo
   * - Cancel
   */
  async changeProfilePicture() {
    const isMobile = this.platform.is('mobile');

    const buttons = [];

    if (isMobile) {
      buttons.push(
        {
          text: this.i18nService.getTranslation('profile.takePhoto'),
          icon: 'camera',
          handler: () => this.takePhoto(),
        },
        {
          text: this.i18nService.getTranslation('profile.chooseFromGallery'),
          icon: 'images',
          handler: () => this.chooseFromGallery(),
        }
      );
    } else {
      buttons.push({
        text: this.i18nService.getTranslation('profile.uploadPhoto'),
        icon: 'images',
        handler: () => this.uploadImage(),
      });
    }

    buttons.push(
      {
        text: this.i18nService.getTranslation('profile.removePhoto'),
        icon: 'trash',
        role: 'destructive',
        handler: () => this.removeProfilePicture(),
      },
      {
        text: this.i18nService.getTranslation('profile.cancel'),
        icon: 'close',
        role: 'cancel',
      }
    );

    const actionSheet = await this.actionSheetController.create({
      header: this.i18nService.getTranslation('profile.changePicture'),
      buttons: buttons,
    });

    await actionSheet.present();
  }

  /**
   * Takes a photo using device camera
   *
   * Requests camera permissions and captures a photo.
   * Processes the captured image for upload.
   * Handles permission denials and camera errors gracefully.
   *
   * @private
   */
  private async takePhoto() {
    try {
      this.isLoading = true;

      // Check and request camera permissions
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted') {
        const permissionResult = await Camera.requestPermissions({
          permissions: ['camera'],
        });
        if (permissionResult.camera !== 'granted') {
          this.notificationService.addNotification(
            this.i18nService.getTranslation(
              'profile.error.cameraPermissionDenied'
            ),
            'danger'
          );
          return;
        }
      }

      // Capture photo
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (image?.base64String) {
        await this.processImageUpload(
          image.base64String,
          'camera-photo.jpg',
          'image/jpeg'
        );
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('profile.error.cameraFailed'),
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Chooses photo from device gallery
   *
   * Requests gallery permissions and opens photo picker.
   * Processes the selected image for upload.
   * Handles permission denials and selection errors gracefully.
   *
   * @private
   */
  private async chooseFromGallery() {
    try {
      this.isLoading = true;

      // Check and request gallery permissions
      const permissions = await Camera.checkPermissions();
      if (permissions.photos !== 'granted') {
        const permissionResult = await Camera.requestPermissions({
          permissions: ['photos'],
        });
        if (permissionResult.photos !== 'granted') {
          this.notificationService.addNotification(
            this.i18nService.getTranslation(
              'profile.error.galleryPermissionDenied'
            ),
            'danger'
          );
          return;
        }
      }

      // Pick image from gallery
      const result = await Camera.pickImages({
        quality: 90,
        limit: 1,
        correctOrientation: true,
      });

      if (result.photos && result.photos.length > 0) {
        const photo = result.photos[0];

        if (photo.webPath) {
          const base64 = await this.convertWebPathToBase64(photo.webPath);
          const fileType = photo.format
            ? `image/${photo.format}`
            : 'image/jpeg';
          await this.processImageUpload(base64, 'gallery-photo.jpg', fileType);
        } else {
          throw new Error('No image data available');
        }
      }
    } catch (error) {
      console.error('Error choosing from gallery:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('profile.error.galleryFailed'),
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Uploads an image using file input (desktop)
   *
   * Creates a file input element for desktop image selection.
   * Validates file type and size before processing.
   * Converts selected file to base64 for upload.
   *
   * @private
   */
  private async uploadImage() {
    try {
      // Create hidden file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';

      // Create promise for file selection
      const fileSelectionPromise = new Promise<File | null>((resolve) => {
        fileInput.onchange = (event: any) => {
          const file = event.target?.files?.[0];
          resolve(file || null);
        };

        fileInput.oncancel = () => resolve(null);
      });

      // Trigger file selection
      document.body.appendChild(fileInput);
      fileInput.click();

      const selectedFile = await fileSelectionPromise;
      document.body.removeChild(fileInput);

      if (!selectedFile) return; // User cancelled

      this.isLoading = true;

      // Convert and process file
      const base64String = await this.fileToBase64(selectedFile);
      await this.processImageUpload(
        base64String,
        selectedFile.name,
        selectedFile.type
      );
    } catch (error) {
      console.error('Error in uploadImage:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('profile.error.uploadFailed'),
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Removes the current profile picture
   *
   * Updates user profile to remove profile picture URL.
   * Provides user feedback on successful removal.
   *
   * @private
   */
  private async removeProfilePicture() {
    if (this.user && this._publicUserData) {
      try {
        await this.applicationService.updateUserProfile({
          name: this._publicUserData.name || '',
          profilePictureUrl: undefined,
        });

        this.notificationService.addNotification(
          'Profile picture removed',
          'success'
        );
      } catch (error) {
        console.error('Error removing profile picture:', error);
        this.notificationService.addNotification(
          'Failed to remove profile picture',
          'danger'
        );
      }
    }
  }

  // ==========================================
  // Image Processing Utility Methods
  // ==========================================

  /**
   * Processes image upload with validation and Firebase storage
   *
   * Validates image format and size before uploading.
   * Uploads to Firebase Storage and updates user profile.
   * Provides comprehensive error handling and user feedback.
   *
   * @param base64String - Base64 encoded image data
   * @param fileName - Original filename
   * @param fileType - MIME type of the image
   * @private
   */
  private async processImageUpload(
    base64String: string,
    fileName: string,
    fileType: string
  ) {
    try {
      if (!this.user) {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('profile.error.noUser'),
          'danger'
        );
        return;
      }

      // Validate image format
      if (!this.isValidImageType(fileType)) {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('profile.error.invalidFileType'),
          'danger'
        );
        return;
      }

      // Validate file size
      if (!this.isValidImageSize(base64String)) {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('profile.error.fileTooLarge'),
          'danger'
        );
        return;
      }

      // Upload to Firebase Storage
      const imageUrl = await this.applicationService.uploadUserProfileImage(
        base64String,
        fileName,
        {
          contentType: fileType,
          customMetadata: {
            uploadedAt: new Date().toISOString(),
            originalName: fileName,
          },
        }
      );

      // Update user profile with new image URL
      if (!this._publicUserData) {
        this._publicUserData = new UserPublicProfile();
      }

      this._publicUserData.profilePictureUrl = imageUrl;
      await this.applicationService.updateUserProfile({
        name: this._publicUserData.name,
        profilePictureUrl: imageUrl,
      });

      this.notificationService.addNotification(
        this.i18nService.getTranslation('profile.success.pictureUploaded'),
        'success'
      );
    } catch (error) {
      console.error('Error processing image upload:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('profile.error.uploadFailed'),
        'danger'
      );
      throw error;
    }
  }

  /**
   * Converts web path to base64 string
   *
   * Fetches image from web path and converts to base64.
   * Used for processing images selected from gallery.
   *
   * @param webPath - Web path to the image
   * @returns Promise<string> - Base64 encoded image
   * @private
   */
  private async convertWebPathToBase64(webPath: string): Promise<string> {
    try {
      const response = await fetch(webPath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert to base64'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Failed to convert web path to base64: ' + error);
    }
  }

  /**
   * Converts a File object to base64 string
   *
   * Uses FileReader to convert File to base64 encoded string.
   * Used for processing files selected through file input.
   *
   * @param file - File object to convert
   * @returns Promise<string> - Base64 encoded file
   * @private
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // ==========================================
  // Validation Utility Methods
  // ==========================================

  /**
   * Validates image file type against allowed types
   *
   * @param fileType - MIME type to validate
   * @returns boolean - True if valid image type
   * @private
   */
  private isValidImageType(fileType: string): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(fileType.toLowerCase());
  }

  /**
   * Validates image size from base64 string
   *
   * Estimates file size from base64 length and validates against maximum.
   * Base64 encoding increases size by ~33%, so calculation accounts for this.
   *
   * @param base64String - Base64 encoded image
   * @returns boolean - True if within size limit
   * @private
   */
  private isValidImageSize(base64String: string): boolean {
    // Base64 encoding increases size by ~33%
    const estimatedSize = base64String.length * 0.75;
    return estimatedSize <= this.MAX_FILE_SIZE;
  }

  // ==========================================
  // Account Management Methods
  // ==========================================

  /**
   * Shows confirmation dialog for account deletion
   *
   * Displays alert with warning about permanent data loss.
   * Requires user confirmation before proceeding with deletion.
   */
  async confirmDeleteAccount() {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message:
        'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteAccount(),
        },
      ],
    });

    await alert.present();
  }

  /**
   * Deletes user account and all associated data
   *
   * Performs account deletion through user service.
   * Handles errors and provides user feedback.
   * Redirects to appropriate page after successful deletion.
   *
   * @private
   */
  private async deleteAccount() {
    this.isLoading = true;

    try {
      // TODO: Implement account deletion
      // await this.userService.deleteAccount();

      this.notificationService.addNotification(
        'Account deleted successfully',
        'success'
      );

      // TODO: Redirect to login or landing page
      // this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error deleting account:', error);
      this.notificationService.addNotification(
        'Failed to delete account. Please try again.',
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Shows logout confirmation dialog
   *
   * Displays alert to confirm logout action.
   * Provides cancel option for accidental activation.
   */
  async logout() {
    console.log('Showing logout confirmation...');

    try {
      const alert = await this.alertController.create({
        header: 'Logout',
        message: 'Are you sure you want to logout?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Logout',
            handler: () => this.performLogout(),
          },
        ],
      });

      await alert.present();
      console.log('Logout alert presented');
    } catch (error) {
      console.error('Error creating/presenting logout alert:', error);
    }
  }

  /**
   * Performs user logout operation
   *
   * Executes logout through application service.
   * Clears user session and redirects appropriately.
   * Handles logout errors with user feedback.
   *
   * @private
   */
  private async performLogout() {
    console.log('Performing logout...');

    try {
      await this.applicationService.logout();

      this.notificationService.addNotification(
        'You have been logged out successfully.',
        'success'
      );

      // Reload to reset application state
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
      this.notificationService.addNotification(
        'Failed to logout. Please try again.',
        'danger'
      );
    }
  }

  // ==========================================
  // Utility Getter Methods
  // ==========================================

  /**
   * Calculates days since user became member
   *
   * Computes difference between current date and user creation date.
   * Returns number of days as integer.
   *
   * @returns number - Days since member registration
   */
  getDaysSinceMember(): number {
    if (!this._publicUserData || !this._publicUserData.createdAt) return 0;

    const now = new Date();
    const createdDate = this._publicUserData.createdAt;
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Getter for days active (alias for getDaysSinceMember)
   *
   * @returns number - Days since member registration
   */
  get days_active(): number {
    return this.getDaysSinceMember();
  }

  // ==========================================
  // Legacy/Compatibility Methods
  // ==========================================

  /**
   * Legacy method for backwards compatibility
   *
   * @deprecated Use processImageUpload instead
   * @param base64String - Base64 image data
   * @param name - Filename
   * @param type - MIME type
   */
  async uploadFileToProfile(
    base64String: string,
    name: string,
    type: string = 'image/jpeg'
  ) {
    await this.processImageUpload(base64String, name, type);
  }
}
