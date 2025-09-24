import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ApplicationService } from '@services/application.service';
import { NotificationService } from '@services/notification.service';
import { User } from '@angular/fire/auth';
import { UserPrivateProfile } from '@models/user_private_profile.model';
import { UserPublicProfile } from '@models/user_public_profile.model';
import { IonCard, IonButton, IonCardContent, IonCardHeader, IonInput, IonItem, IonLabel, IonSpinner, ModalController, IonIcon, IonCardTitle, IonText, IonNote  } from "@ionic/angular/standalone";

@Component({
  selector: 'app-profile-edit-modal',
  templateUrl: './profile-edit-modal.component.html',
  styleUrls: ['./profile-edit-modal.component.scss'],
  standalone: true,
  imports: [IonCard, IonIcon, IonNote, IonText, IonCardTitle, ReactiveFormsModule, IonCardHeader, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner],
})
export class ProfileEditModalComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  @Input() user_obj: {
    user: User;
    privateData: UserPrivateProfile;
    publicData: UserPublicProfile;
  } | undefined;

  isLoading = false;
  passwordMismatch = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private applicationService: ApplicationService,
    private notificationService: NotificationService
  ) {
   
  }

  ngOnInit() {
    console.log('User object received in modal:', this.user_obj);
    this.initializeForm();
  }

  ngOnDestroy() {}

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
  }

  /**
   * Populates the form with user data
   */
  private populateForm() {
    if (this.user_obj) {
      this.profileForm.patchValue({
        displayName: this.user_obj.publicData.name || '',
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
    console.log('Updating profile with data:', this.profileForm.value);
    if (this.profileForm.invalid || this.passwordMismatch) {
      this.notificationService.addNotification(
        'Please fix the form errors before saving.',
        'danger'
      );
      return;
    }

    this.isLoading = true;

    const formData = this.profileForm.value;

    if(!this.user_obj) {
        this.isLoading = false;
        return;
    }
    if (this.user_obj.user.isAnonymous) {
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
        if (formData.displayName != this.user_obj.publicData.name) {
          this.user_obj.publicData.name = formData.displayName;
          console.log('Display name changed:', formData.displayName);
          this.applicationService.updateUserProfile(
            this.user_obj.publicData.toDB()
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
      } catch(error: any) {
        if (error.code && error.code === 'auth/wrong-password') {
          this.profileForm
            .get('currentPassword')
            ?.setErrors({ incorrect: true });
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
