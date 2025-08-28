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
  AlertController,
  LoadingController,
} from '@ionic/angular/standalone';
import { Subscription, take } from 'rxjs';
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
import { I18nService } from 'src/app/core/services/i18n.service';

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

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private loadingController = inject(LoadingController);
  private applicationService = inject(ApplicationService);
  private notificationService = inject(NotificationService);
  private i18nService = inject(I18nService);

  constructor() {
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
      if (user && !user.isAnonymous) {
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

    // Show loading
    const loading = await this.loadingController.create({
      message: this.i18nService.getTranslation('login.signing_in'),
      duration: 30000, // 30 seconds timeout
    });
    await loading.present();

    this.applicationService.loginWithEmail(email, password).then(
      () => {
        this.isLoading = false;
        // Attempt login

        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userEmail');
        }

        loading.dismiss();
      },
      (error) => {
        this.isLoading = false;
        this.loadingController.dismiss();
        console.error('Login error:', error);
        this.handleLoginError(error);
      }
    );
  }

  /**
   * Handles login errors
   */
  private handleLoginError(error: any) {
    let errorMessage = this.i18nService.getTranslation('login.failed');
    console.log('Error: ', error);
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = this.i18nService.getTranslation(
            'login.user_not_found'
          );
          break;
        case 'auth/wrong-password':
          errorMessage = this.i18nService.getTranslation(
            'login.wrong_password'
          );
          break;
        case 'auth/invalid-email':
          errorMessage = this.i18nService.getTranslation('login.invalid_email');
          break;
        case 'auth/invalid-credential':
          errorMessage = this.i18nService.getTranslation(
            'login.credentials_wrong'
          );
          break;
        case 'auth/user-disabled':
          errorMessage = this.i18nService.getTranslation('login.user_disabled');
          break;
        case 'auth/too-many-requests':
          errorMessage = this.i18nService.getTranslation(
            'login.too_many_requests'
          );
          break;
        case 'auth/network-request-failed':
          errorMessage = this.i18nService.getTranslation(
            'login.network_request_failed'
          );
          break;
        default:
          errorMessage =
            error.message ||
            this.i18nService.getTranslation('login.unexpected_error');
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
        message: this.i18nService.getTranslation('login.signing_in_guest'),
        duration: 15000,
      });
      await loading.present();

      await this.applicationService.loginAnonymously();

      await loading.dismiss();

      this.notificationService.addNotification(
        this.i18nService.getTranslation('login.guest_login_success'),
        'success'
      );

      this.router.navigate(['/tabs']);
    } catch (error: any) {
      this.isLoading = false;
      this.loadingController.dismiss();

      console.error('Anonymous login error:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('login.guest_login_failed'),
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
      header: this.i18nService.getTranslation('login.reset_password'),
      message: this.i18nService.getTranslation('login.reset_password_message'),
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: this.i18nService.getTranslation('login.email_address'),
          value: this.loginForm.get('email')?.value || '',
        },
      ],
      buttons: [
        {
          text: this.i18nService.getTranslation('common.cancel'),
          role: 'cancel',
        },
        {
          text: this.i18nService.getTranslation('login.send_reset_link'),
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
        message: this.i18nService.getTranslation('login.sending_reset_link'),
        duration: 10000,
      });
      await loading.present();

      await this.applicationService.resetPassword(email);

      await loading.dismiss();

      this.notificationService.addNotification(
        this.i18nService.getTranslation('login.reset_link_sent'),
        'success'
      );
    } catch (error: any) {
      this.loadingController.dismiss();

      console.error('Password reset error:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('login.reset_link_failed'),
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
