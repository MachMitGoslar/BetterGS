import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
} from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
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
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/core/services/application.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { LanguageSelectorComponent } from 'src/app/components/language-selector/language-selector.component';
import { addIcons } from 'ionicons';
import {
  trophyOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  personOutline,
  warningOutline,
  logInOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonIcon,
    IonCheckbox,
    IonLabel,
    IonText,
    IonSpinner,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private applicationService: ApplicationService,
    private notificationService: NotificationService
  ) {
    this.initializeForm();
    this.setupIcons();
  }

  ngOnInit() {
    // Check if user is already logged in
    this.checkAuthState();
    // Load remembered email if available
    this.loadRememberedEmail();
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
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'person-outline': personOutline,
      'warning-outline': warningOutline,
      'log-in-outline': logInOutline,
    });
  }

  /**
   * Initializes the reactive form
   */
  private initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  /**
   * Checks if user is already authenticated
   */
  private checkAuthState() {
    const userSub = this.applicationService.$currentUser.subscribe((user) => {
      if (user && !user.firestoreUser?.isAnonymous) {
        // User is logged in, redirect to home
        this.router.navigate(['/tabs']);
      }
    });
    this.subscriptions.push(userSub);
  }

  /**
   * Checks if a form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Toggles password visibility
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles form submission
   */
  async onLogin() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, rememberMe } = this.loginForm.value;

    try {
      // Show loading
      const loading = await this.loadingController.create({
        message: 'Signing in...',
        duration: 30000, // 30 seconds timeout
      });
      await loading.present();

      // Attempt login
      await this.applicationService.loginWithEmail(email, password);

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userEmail');
      }

      await loading.dismiss();

      // Show success message
      this.notificationService.addNotification(
        'Login successful! Welcome back.',
        'success'
      );

      // Redirect to home
      this.router.navigate(['/tabs']);
    } catch (error: any) {
      this.isLoading = false;
      
      // Dismiss loading if still present
      this.loadingController.dismiss();

      console.error('Login error:', error);

      // Handle specific error messages
      this.handleLoginError(error);
    }

    this.isLoading = false;
  }

  /**
   * Handles login errors
   */
  private handleLoginError(error: any) {
    let errorMessage = 'Login failed. Please try again.';

    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
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
   * Handles anonymous login
   */
  async onAnonymousLogin() {
    this.isLoading = true;

    try {
      const loading = await this.loadingController.create({
        message: 'Signing in as guest...',
        duration: 15000,
      });
      await loading.present();

      await this.applicationService.loginAnonymously();

      await loading.dismiss();

      this.notificationService.addNotification(
        'Signed in as guest successfully!',
        'success'
      );

      this.router.navigate(['/tabs']);
    } catch (error: any) {
      this.isLoading = false;
      this.loadingController.dismiss();

      console.error('Anonymous login error:', error);
      this.notificationService.addNotification(
        'Failed to sign in as guest. Please try again.',
        'danger'
      );
    }

    this.isLoading = false;
  }

  /**
   * Handles forgot password
   */
  async onForgotPassword() {
    const alert = await this.alertController.create({
      header: 'Reset Password',
      message: 'Enter your email address to receive a password reset link.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email address',
          value: this.loginForm.get('email')?.value || '',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Send Reset Link',
          handler: async (data) => {
            if (data.email) {
              await this.sendPasswordReset(data.email);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Sends password reset email
   */
  private async sendPasswordReset(email: string) {
    try {
      const loading = await this.loadingController.create({
        message: 'Sending reset link...',
        duration: 10000,
      });
      await loading.present();

      await this.applicationService.resetPassword(email);

      await loading.dismiss();

      this.notificationService.addNotification(
        'Password reset link sent to your email.',
        'success'
      );
    } catch (error: any) {
      this.loadingController.dismiss();

      console.error('Password reset error:', error);
      this.notificationService.addNotification(
        'Failed to send reset link. Please check your email address.',
        'danger'
      );
    }
  }

  /**
   * Navigates to sign up page
   */
  onSignUp() {
    this.router.navigate(['/signup']);
  }

  /**
   * Marks all form fields as touched
   */
  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Pre-fills email if remembered
   */
  private loadRememberedEmail() {
    const rememberMe = localStorage.getItem('rememberMe');
    const userEmail = localStorage.getItem('userEmail');

    if (rememberMe === 'true' && userEmail) {
      this.loginForm.patchValue({
        email: userEmail,
        rememberMe: true,
      });
    }
  }
}
