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
  ModalController,
} from '@ionic/angular/standalone';
import { User } from '@angular/fire/auth';
import {
  count,
  defaultIfEmpty,
  map,
  Observable,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { NotificationService } from '@services/notification.service';
import { ApplicationService } from '@services/application.service';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';
import { LanguageSelectorComponent } from '@components/language-selector/language-selector.component';
import { Router } from '@angular/router';
import { ProfilePictureComponent } from '@components/profile-picture/profile-picture.component';
import { I18nPipe } from 'src/app/core/pipes/i18n.pipe';
import { I18nService } from '@services/i18n.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { UserPublicProfile } from '@models/user_public_profile.model';
import { UserPrivateProfile } from '@models/user_private_profile.model';
import { UserService } from '@services/user.service';
import { ActiveTrackingBarComponent } from '@components/active-tracking-bar/active-tracking-bar.component';
import { ActivityCardComponent } from '@components/activity-card/activity-card.component';
import { ProfileEditModalComponent } from '@components/profile-edit-modal/profile-edit-modal.component';
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
    //LanguageSelectorComponent,
    I18nPipe,
    ActiveTrackingBarComponent,
    ActivityCardComponent,
  ],
})
export class ProfilePage implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private alertController = inject(AlertController);
  private actionSheetController = inject(ActionSheetController);
  private notificationService = inject(NotificationService);
  applicationService = inject(ApplicationService);
  router = inject(Router);
  private i18nService = inject(I18nService);
  private platform = inject(Platform);
  private userService = inject(UserService);
  private modalController = inject(ModalController);

  user: User | null = null;
  $user = new Observable<User | null>();
  _publicUserData: UserPublicProfile | undefined;
  _privateUserData: UserPrivateProfile | undefined;
  profileForm!: FormGroup;
  isLoading: boolean = false;
  passwordMismatch: boolean = false;
  $userActivityCount: Observable<number>;

  private subscriptions: Subscription[] = [];

  constructor() {
    this.$userActivityCount = this.applicationService.$user_activities.pipe(
      map((activities) => {
        return activities.filter((a) => a.timeSpend > 0).length;
      }),
      defaultIfEmpty(0)
    );
  }

  ngOnInit() {
    this.$user = this.applicationService.$currentUser;

    this.loadUserProfile();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Loads user profile data
   */
  private loadUserProfile() {
    // TODO: Replace with actual user service
    // For now, create a mock user
    this.$user.subscribe((user) => {
      this.user = user;
      console.log('Current user:', this.user);
    });
    this.userService.$currentUserPrivateProfile.subscribe((profile) => {
      this._privateUserData = profile;
    });

    this.userService.$currentUserProfile.subscribe((profile) => {
      this._publicUserData = profile;
      console.log('Public user data:', this._publicUserData);
    });
  }

  /**
   * Changes profile picture
   */
  async changeProfilePicture() {
    let sheet_options = {};
    if (this.platform.is('mobile')) {
      sheet_options = {
        header: this.i18nService.getTranslation('profile.changePicture'),
        buttons: [
          {
            text: this.i18nService.getTranslation('profile.takePhoto'),
            icon: 'camera',
            handler: () => {
              this.takePhoto();
            },
          },
          {
            text: this.i18nService.getTranslation('profile.chooseFromGallery'),
            icon: 'images',
            handler: () => {
              this.chooseFromGallery();
            },
          },
          {
            text: this.i18nService.getTranslation('profile.removePhoto'),
            icon: 'trash',
            role: 'destructive',
            handler: () => {
              this.removeProfilePicture();
            },
          },
          {
            text: this.i18nService.getTranslation('profile.cancel'),
            icon: 'close',
            role: 'cancel',
          },
        ],
      };
    } else {
      sheet_options = {
        header: this.i18nService.getTranslation('profile.changePicture'),
        buttons: [
          {
            text: this.i18nService.getTranslation('profile.uploadPhoto'),
            icon: 'images',
            handler: () => {
              this.uploadImage();
            },
          },
          {
            text: this.i18nService.getTranslation('profile.removePhoto'),
            icon: 'trash',
            role: 'destructive',
            handler: () => {
              this.removeProfilePicture();
            },
          },
          {
            text: this.i18nService.getTranslation('profile.cancel'),
            icon: 'close',
            role: 'cancel',
          },
        ],
      };
    }

    const actionSheet = await this.actionSheetController.create(
      sheet_options as any
    );

    await actionSheet.present();
  }

  /**
   * Takes a photo using camera
   */
  private async takePhoto() {
    try {
      this.isLoading = true;

      // Check camera permissions
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

      // Take photo
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
   * Chooses photo from gallery
   */
  private async chooseFromGallery() {
    try {
      this.isLoading = true;

      // Check and request permissions
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

        // GalleryPhoto has webPath, we need to convert it to base64
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
   * Converts web path to base64 string
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
   * Removes profile picture
   */
  private async removeProfilePicture() {
    if (this.user) {
      this.applicationService.updateUserProfile({
        name: this._publicUserData?.name || '',
        profilePictureUrl: undefined,
      });
      this.notificationService.addNotification(
        'Profile picture removed',
        'success'
      );
    }
  }

  /**
   * Uploads an image from file input
   */
  private async uploadImage() {
    try {
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';

      // Create a promise to handle the file selection
      const fileSelectionPromise = new Promise<File | null>((resolve) => {
        fileInput.onchange = (event: any) => {
          const file = event.target?.files?.[0];
          resolve(file || null);
        };

        fileInput.oncancel = () => {
          resolve(null);
        };
      });

      // Add to DOM and trigger click
      document.body.appendChild(fileInput);
      fileInput.click();

      // Wait for file selection
      const selectedFile = await fileSelectionPromise;

      // Clean up
      document.body.removeChild(fileInput);

      if (!selectedFile) {
        return; // User cancelled
      }

      this.isLoading = true;

      // Convert file to base64 for upload
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
   * Common method to process image upload with validation
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

      // Validate file size (approximate from base64)
      if (!this.isValidImageSize(base64String)) {
        this.notificationService.addNotification(
          this.i18nService.getTranslation('profile.error.fileTooLarge'),
          'danger'
        );
        return;
      }

      // Upload to Firebase
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

      // Update user profile
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
   * Validates image file type
   */
  private isValidImageType(fileType: string): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return validTypes.includes(fileType.toLowerCase());
  }

  /**
   * Validates image size from base64 string (max 5MB)
   */
  private isValidImageSize(base64String: string): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    // Base64 encoding increases size by ~33%, so we need to account for that
    const estimatedSize = base64String.length * 0.75;
    return estimatedSize <= maxSize;
  }

  /**
   * Legacy method for backwards compatibility
   * @deprecated Use processImageUpload instead
   */
  async uploadFileToProfile(
    base64String: string,
    name: string,
    type: string = 'image/jpeg'
  ) {
    await this.processImageUpload(base64String, name, type);
  }

  /**x
   * Converts a File to base64 string
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

  /**
   * Confirms account deletion
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
          handler: () => {
            this.deleteAccount();
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Deletes user account
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

      // Redirect to login or landing page
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
   * Logs out the user
   */
  async logout() {
    console.log('Logging out user...', this.alertController);

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
            handler: () => {
              this.performLogout();
            },
          },
        ],
      });
      try {
        await alert.present();
        console.log('Logout alert presented');
      } catch (error) {
        console.error('Error presenting logout alert:', error);
      }
    } catch (error) {
      console.error('Error creating logout alert:', error);
    }
  }

  /**
   * Opens the edit modal
   */
  public openEditModal() {
    this.isLoading = true;
    this.modalController
      .create({
        component: ProfileEditModalComponent,
        componentProps: {
          user_obj: {
            user: this.user,
            publicProfile: this._publicUserData,
            privateProfile: this._privateUserData,
          },
        },
      })
      .then((modal) => {
        modal.present();
        this.isLoading = false;
      });
  }

  /**
   * Performs logout
   */
  private async performLogout() {
    console.log('Logging out user...');

    try {
      // TODO: Implement logout logic
      await this.applicationService.logout();

      this.notificationService.addNotification(
        'You have been logged out successfully.',
        'success'
      );

      // Redirect to login page
      window.location.reload(); // Reload to reset state
    } catch (error) {
      console.error('Error logging out:', error);
      this.notificationService.addNotification(
        'Failed to logout. Please try again.',
        'danger'
      );
    }
  }

  /**
   * Gets days since member
   */
  getDaysSinceMember(): number {
    if (!this._publicUserData || !this._publicUserData.createdAt) return 0;

    const now = new Date();
    const createdDate = this._publicUserData.createdAt;
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  get days_active(): number {
    let now = new Date();
    if (!this._publicUserData || !this._publicUserData.createdAt) return 0;
    const diffTime = Math.abs(
      now.getTime() - this._publicUserData.createdAt.getTime()
    );
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return diffDays;
  }
}
