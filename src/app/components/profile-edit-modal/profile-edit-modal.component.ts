import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ApplicationService } from '@services/application.service';
import { NotificationService } from '@services/notification.service';
import { User } from '@angular/fire/auth';
import { UserPrivateProfile } from '@models/user_private_profile.model';
import { UserPublicProfile } from '@models/user_public_profile.model';
import {
  IonCard,
  IonButton,
  IonCardContent,
  IonCardHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSpinner,
  ModalController,
  IonIcon,
  IonCardTitle,
  IonText,
  IonNote,
  IonContent,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-edit-modal',
  templateUrl: './profile-edit-modal.component.html',
  styleUrls: ['./profile-edit-modal.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonIcon,
    IonNote,
    IonText,
    IonCardTitle,
    ReactiveFormsModule,
    IonCardHeader,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner,
    IonContent,
    IonHeader,
    IonButtons,
    IonToolbar,
    IonTitle,
    CommonModule,
  ],
})
export class ProfileEditModalComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private modalController = inject(ModalController);
  private applicationService = inject(ApplicationService);
  private notificationService = inject(NotificationService);

  profileForm!: FormGroup;
  @Input() user_obj:
    | {
        user: User;
        privateProfile: UserPrivateProfile;
        publicProfile: UserPublicProfile;
      }
    | undefined;

  isLoading = false;
  passwordMismatch = false;

  ngOnInit() {
    this.initializeForm();
  }

  /**
   * Closes the modal
   */
  async closeModal() {
    await this.modalController.dismiss();
  }

  /**
   * Initializes the reactive form
   */
  private initializeForm() {
    this.profileForm = this.formBuilder.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
    });

    // Watch for password confirmation
    this.profileForm
      .get('confirmPassword')
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe(() => {
        this.checkPasswordMatch();
      });

    this.profileForm
      .get('newPassword')
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe(() => {
        this.checkPasswordMatch();
      });

    // Disable email field if user is not anonymous
    if (!this.user_obj?.user.isAnonymous) {
      this.profileForm.get('email')?.disable();
    }

    this.populateForm();
  }

  /**
   * Populates the form with user data
   */
  private populateForm() {
    if (this.user_obj) {
      this.profileForm.patchValue({
        displayName: this.user_obj.publicProfile.name || '',
        email: this.user_obj.user.email || '',
      });
    }
  }

  /**
   * Checks if passwords match
   */
  private checkPasswordMatch() {
    const newPassword = this.profileForm.get('newPassword')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;

    this.passwordMismatch =
      newPassword && confirmPassword && newPassword !== confirmPassword;
  }

  /**
   * Updates user profile
   */
  async updateProfile() {
    console.log('Name: ', this.user_obj?.publicProfile.name);
    console.log('Updating profile with data:', this.profileForm.value);
    if (this.profileForm.invalid || this.passwordMismatch) {
      console.warn('Form is invalid or passwords do not match');
      this.notificationService.addNotification(
        'Please fix the form errors before saving.',
        'danger'
      );
      return;
    }

    this.isLoading = true;

    const formData = this.profileForm.value;

    if (!this.user_obj) {
      console.warn('No user object available');
      this.isLoading = false;
      return;
    }
    if (this.user_obj.user.isAnonymous) {
      console.log('Anonymous user registering with email:', formData.email);
      try {
        await this.applicationService.registerUserWithEmail(
          formData.email,
          formData.newPassword,
          formData.displayName
        );
        this.isLoading = false;
        await this.closeModal();
        return;
      } catch (error) {
        this.isLoading = false;
        console.error('Error registering user:', error);
        this.notificationService.addNotification(
          'Failed to register user. Please try again.',
          'danger'
        );
      } finally {
        return;
      }
    } else {
      try {
        // Update display name if changed
        if (this.user_obj.publicProfile.name != formData.displayName) {
          this.user_obj.publicProfile.name = formData.displayName;
          await this.applicationService.updateUserProfile(
            this.user_obj.publicProfile.toDB()
          );
        }
        //Handle password change
        if (formData.newPassword && formData.currentPassword) {
          await this.applicationService.changePassword(
            formData.newPassword,
            formData.currentPassword
          );
          // Clear password fields after successful update
          this.profileForm.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
        await this.closeModal();
      } catch (error: any) {
        if (error.code == 'auth/invalid-credential') {
          console.log('Auth was invalid, possibly due to session expiration.');
          this.profileForm
            .get('currentPassword')
            ?.setErrors({ incorrect: true });
          return;
        }
        console.error('Error updating profile:', error);
        this.notificationService.addNotification(
          'Failed to update profile. Please try again.',
          'danger'
        );
      } finally {
        this.isLoading = false;
      }
    }
  }

  /**
   * Resets form to original values
   */
  resetForm() {
    this.passwordMismatch = false;
  }
}
