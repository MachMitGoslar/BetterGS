import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Camera } from '@capacitor/camera';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';
import { I18nService } from '../../core/services/i18n.service';
import { ApplicationService } from '../../core/services/application.service';
import { User } from "@angular/fire/auth";
import { take } from 'rxjs';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonIcon, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent, 
  IonButton, 
  IonSpinner, 
  IonChip, 
  IonNote 
} from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonChip,
    IonNote
  ]
})
export class OnboardingComponent implements OnInit {
  currentStep = 'introduction';
  isLoading = false;
  isMobile = false;

  // Permission states
  cameraPermissionGranted = false;
  photoLibraryPermissionGranted = false;
  notificationPermissionGranted = false;

  // Current user
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private platform: Platform,
    public i18nService: I18nService,
    private applicationService: ApplicationService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    // Check if device is mobile
    this.isMobile = this.platform.is('capacitor');
    
    // Get current user
    this.applicationService.$currentUser.pipe(take(1)).subscribe((user: User | null) => {
      this.currentUser = user;
    });

    // Check existing permissions
    if (this.isMobile) {
      await this.checkExistingPermissions();
    }
  }

  async checkExistingPermissions() {
    try {
      // Check camera permissions
      const cameraStatus = await Camera.checkPermissions();
      this.cameraPermissionGranted = cameraStatus.camera === 'granted';
      this.photoLibraryPermissionGranted = cameraStatus.photos === 'granted';

      // Check notification permissions
      const notificationStatus = await LocalNotifications.checkPermissions();
      this.notificationPermissionGranted = notificationStatus.display === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }

  onSegmentChanged(event: any) {
    this.currentStep = event.detail.value;
  }

  async requestCameraPermission() {
    if (!this.isMobile) return;

    this.isLoading = true;
    try {
      const result = await Camera.requestPermissions({
        permissions: ['camera']
      });
      this.applicationService.cameraPermissionGranted = result.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async requestPhotoLibraryPermission() {
    if (!this.isMobile) return;

    this.isLoading = true;
    try {
      const result = await Camera.requestPermissions({
        permissions: ['photos']
      });
      this.applicationService.photoLibraryPermissionGranted = result.photos === 'granted';
    } catch (error) {
      console.error('Error requesting photo library permission:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async requestNotificationPermission() {
    if (!this.isMobile) return;

    this.isLoading = true;
    try {
      const result = await LocalNotifications.requestPermissions();
      this.applicationService.notificationsEnabled = result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      this.isLoading = false;
    }
  }

  nextStep() {
    switch (this.currentStep) {
      case 'introduction':
        this.currentStep = this.isMobile ? 'permissions' : 'notifications';
        break;
      case 'permissions':
        this.currentStep = 'notifications';
        break;
      case 'notifications':
        this.completeOnboarding();
        break;
    }
  }

  previousStep() {
    switch (this.currentStep) {
      case 'notifications':
        this.currentStep = this.isMobile ? 'permissions' : 'introduction';
        break;
      case 'permissions':
        this.currentStep = 'introduction';
        break;
    }
  }

  async completeOnboarding() {
    if (!this.currentUser) return;

    this.isLoading = true;
    try {
      // Update user's onboarding status in the database
      await this.userService.updateUserOnboardingStatus(this.currentUser.uid, true);

    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      this.isLoading = false;
      this.router.navigate(['/tabs']);
    }
  }

  skipOnboarding() {
    this.completeOnboarding();
  }

  // Helper methods for template
  canProceedFromPermissions(): boolean {
    return !this.isMobile || (this.cameraPermissionGranted && this.photoLibraryPermissionGranted);
  }

  canCompleteOnboarding(): boolean {
    return !this.isMobile || this.notificationPermissionGranted;
  }
}
