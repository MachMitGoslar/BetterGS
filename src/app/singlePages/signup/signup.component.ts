import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonCheckbox,
  IonLabel,
  IonText,
  IonSpinner,
  LoadingController,
  ModalController,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/core/services/application.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { addIcons } from 'ionicons';
import {
  trophyOutline,
  arrowBackOutline,
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  warningOutline,
} from 'ionicons/icons';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonCheckbox,
    IonLabel,
    IonText,
    IonSpinner,
  ],
})
export class SignupComponent implements OnInit, OnDestroy {
  signupForm!: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordMismatch: boolean = false;
  errorMessage: string = '';

  private subscriptions: Subscription[] = [];

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private modalController = inject(ModalController);
  private loadingController = inject(LoadingController);
  private applicationService = inject(ApplicationService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.initializeForm();
    this.setupIcons();
  }

  ngOnInit() {
    // Check if user is already logged in
    this.checkAuthState();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Sets up Ionicons
   */
  private setupIcons() {
    addIcons({
      'trophy-outline': trophyOutline,
      'arrow-back-outline': arrowBackOutline,
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'warning-outline': warningOutline,
    });
  }

  /**
   * Initializes the reactive form
   */
  private initializeForm() {
    this.signupForm = this.formBuilder.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]],
    });

    // Watch for password confirmation
    this.signupForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });

    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
  }

  /**
   * Checks if user is already authenticated
   */
  private checkAuthState() {
    const userSub = this.applicationService.$currentUser.subscribe((user) => {
      if (user && !user.isAnonymous) {
        // User is logged in, redirect to home
        this.router.navigate(['/tabs']);
      }
    });
    this.subscriptions.push(userSub);
  }

  /**
   * Checks if passwords match
   */
  private checkPasswordMatch() {
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = this.signupForm.get('confirmPassword')?.value;

    this.passwordMismatch =
      password && confirmPassword && password !== confirmPassword;
  }

  /**
   * Checks if a form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Toggles password visibility
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggles confirm password visibility
   */
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Handles form submission
   */
  async onSignUp() {
    if (this.signupForm.invalid || this.passwordMismatch) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { displayName, email, password } = this.signupForm.value;

    try {
      // Show loading
      const loading = await this.loadingController.create({
        message: 'Creating your account...',
        duration: 30000, // 30 seconds timeout
      });
      await loading.present();

      // Create the user account
      await this.applicationService.createUserWithEmailAndDisplayName(
        email,
        password,
        displayName
      );

      // Show success message
      this.notificationService.addNotification(
        'Account created successfully! Welcome to BetterGS.',
        'success'
      );

      await loading.dismiss();
      this.isLoading = false;

      // Redirect to tabs after successful signup
      this.router.navigate(['/tabs']);
    } catch (error) {
      this.isLoading = false;
      console.error('Sign up error:', error);
      this.handleSignUpError(error);

      // Dismiss loading if still present
      this.loadingController.dismiss();
    }
  }

  /**
   * Handles sign up errors
   */
  private handleSignUpError(error: any) {
    let errorMessage = 'Sign up failed. Please try again.';

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/weak-password':
          errorMessage =
            'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
    }

    this.errorMessage = errorMessage;
    this.notificationService.addNotification(errorMessage, 'danger');
  }

  /**
   * Goes back to previous page
   */
  goBack() {
    this.router.navigate(['/login']);
  }

  /**
   * Navigates to login page
   */
  onLogin() {
    this.router.navigate(['/login']);
  }

  /**
   * Shows terms of service
   */
  async showTerms() {
    const modal = await this.modalController.create({
      component: TermsComponent,
    });

    await modal.present();
  }

  /**
   * Shows privacy policy
   */
  async showPrivacy() {
    const modal = await this.modalController.create({
      component: PrivacyComponent,
    });

    await modal.present();
  }

  /**
   * Marks all form fields as touched
   */
  private markFormGroupTouched() {
    Object.keys(this.signupForm.controls).forEach((key) => {
      this.signupForm.get(key)?.markAsTouched();
    });
  }
}
