const ICON_LIST = {

}

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonItem,
  IonInput,
  IonTextarea,
  IonLabel,
  IonButton,
  IonSpinner,
  IonNote,
  IonSearchbar,
  IonChip,
  IonModal,
  IonButtons,
  AlertController,
  ActionSheetController
} from '@ionic/angular/standalone';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import {
  warning,
  fitness,
  people,
  time,
  trendingUp,
  addCircle,
  add,
  list,
  image,
  closeCircle,
  create,
  pause,
  play,
  trash,
  close,
  calendar,
  // Activity icons for picker
  walk,
  bicycle,
  barbell,
  football,
  basketball,
  tennisball,
  heart,
  leaf,
  musicalNotes,
  brush,
  camera,
  book,
  laptop,
  gameController,
  car,
  train,
  airplane,
  home,
  restaurant,
  cafe,
  //Additional icons
  globe,
  construct,
  fastFood,
  medal,
  moon,
  paw,
  receipt,

} from 'ionicons/icons';

import { User } from 'src/app/core/models/user.model';
import { Activity } from 'src/app/core/models/activity.model';
import { ApplicationService } from 'src/app/core/services/application.service';
import { ActivityService } from 'src/app/core/services/activity.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { I18nService } from 'src/app/core/services/i18n.service';
import { I18nPipe } from 'src/app/core/pipes/i18n.pipe';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.page.html',
  styleUrls: ['./admin-page.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
    IonLabel,
    IonButton,
    IonSpinner,
    IonNote,
    IonSearchbar,
    IonChip,
    IonModal,
    IonButtons,
    I18nPipe,
    ElapsedTimePipe
  ]
})
export class AdminPagePage implements OnInit, OnDestroy {
  
  @ViewChild('iconModal') iconModal!: IonModal;

  // User and permission properties
  currentUser: User | null = null;
  isAdmin: boolean = false;

  // Form and UI state
  activityForm!: FormGroup;
  isLoading: boolean = false;
  
  // Activity management
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  searchTerm: string = '';

  // Image and icon selection
  selectedIcon: string = 'fitness';
  selectedImageFile: File | null = null;
  selectedImagePreview: string | null = null;
  showIconPicker: boolean = false;

  // Statistics
  totalActivities: number = 0;
  totalUsers: number = 0;
  totalTrackingTime: number = 0;
  activeTrackings: number = 0;

  // Available icons for activity selection
  availableIcons: string[] = [
    'fitness',
    'walk',
    'bicycle',
    'barbell',
    'football',
    'basketball',
    'tennisball',
    'heart',
    'leaf',
    'musical-notes',
    'brush',
    'camera',
    'book',
    'laptop',
    'game-controller',
    'car',
    'train',
    'airplane',
    'home',
    'restaurant',
    'cafe',
    'globe',
    'construct',
    'fast-food',
    'medal',
    'moon',
    'paw',
    'receipt',
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private applicationService: ApplicationService,
    private activityService: ActivityService,
    private notificationService: NotificationService,
    private i18nService: I18nService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {
    this.initializeForm();
    this.setupIcons();
  }

  ngOnInit() {
    this.loadUserData();
    this.loadActivities();
    this.loadStatistics();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Initialize the reactive form for creating activities
   */
  private initializeForm() {
    this.activityForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  /**
   * Setup ionicons for the component
   */
  private setupIcons() {
    addIcons({
      warning,
  fitness,
  people,
  time,
  trendingUp,
  addCircle,
  add,
  list,
  image,
  closeCircle,
  create,
  pause,
  play,
  trash,
  close,
  calendar,
  // Activity icons for picker
  walk,
  bicycle,
  barbell,
  football,
  basketball,
  tennisball,
  heart,
  leaf,
  musicalNotes,
  brush,
  camera,
  book,
  laptop,
  gameController,
  car,
  train,
  airplane,
  home,
  restaurant,
  cafe,
  //Additional icons
  globe,
  construct,
  fastFood,
  medal,
  moon,
  paw,
  receipt,
    });
  }

  /**
   * Load current user data and check admin permissions
   */
  private loadUserData() {
    const userSub = this.applicationService.$currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === 'admin';
    });
    this.subscriptions.push(userSub);
  }

  /**
   * Load activities data
   */
  private loadActivities() {
    const activitiesSub = this.activityService.$activities.subscribe(activities => {
      this.activities = activities;
      this.filterActivities();
    });
    this.subscriptions.push(activitiesSub);
  }

  /**
   * Load dashboard statistics
   */
  private loadStatistics() {
    // Total activities
    const activitiesSub = this.activityService.$activities.subscribe(activities => {
      this.totalActivities = activities.length;
    });
    this.subscriptions.push(activitiesSub);

    // Other statistics would need to be implemented based on your data structure
    // For now, setting placeholder values
    this.totalUsers = 0; // This would come from a user service
    this.totalTrackingTime = 0; // This would come from tracking service
    this.activeTrackings = 0; // This would come from tracking service
  }

  /**
   * Filter activities based on search term
   */
  filterActivities() {
    if (!this.searchTerm.trim()) {
      this.filteredActivities = this.activities;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredActivities = this.activities.filter(activity =>
        activity.title.toLowerCase().includes(term) ||
        activity.description.toLowerCase().includes(term)
      );
    }
  }

  /**
   * Create a new activity
   */
  async createActivity() {
    if (this.activityForm.invalid) {
      this.notificationService.addNotification(
        this.i18nService.getTranslation('admin.form.validationError'),
        'danger'
      );
      return;
    }

    this.isLoading = true;

    try {
      const formData = this.activityForm.value;
      
      // Create new activity instance
      const newActivity = new Activity();
      console.log('Creating new activity:', newActivity);
      newActivity.title = formData.title;
      newActivity.description = formData.description || '';
      newActivity.icon = this.selectedIcon;

      // Upload image if selected
      if (this.selectedImageFile) {
        const base64String = await this.fileToBase64(this.selectedImageFile);
        const imageUrl = await this.applicationService.uploadUserProfileImage(
          base64String,
          `activity-${newActivity.id}-${this.selectedImageFile.name}`,
          {
            contentType: this.selectedImageFile.type,
            customMetadata: {
              uploadedAt: new Date().toISOString(),
              activityId: newActivity.id
            }
          }
        );4
        newActivity.imageUrl = imageUrl;
      }

      // Save to database
      await this.activityService.addActivity(newActivity);

      // Reset form
      this.resetForm();

      this.notificationService.addNotification(
        this.i18nService.getTranslation('admin.success.activityCreated'),
        'success'
      );

    } catch (error) {
      console.error('Error creating activity:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('admin.error.createFailed'),
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Reset the creation form
   */
  private resetForm() {
    this.activityForm.reset();
    this.selectedIcon = 'fitness';
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
  }

  /**
   * Open icon picker modal
   */
  openIconPicker() {
    this.showIconPicker = true;
  }

  /**
   * Select an icon for the activity
   */
  selectIcon(iconName: string) {
    this.selectedIcon = iconName;
    this.showIconPicker = false;
    console.log('Selected icon:', this.selectedIcon);
  }

  /**
   * Select image file for activity
   */
  async selectImage() {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';

      const fileSelectionPromise = new Promise<File | null>((resolve) => {
        fileInput.onchange = (event: any) => {
          const file = event.target?.files?.[0];
          resolve(file || null);
        };
        fileInput.oncancel = () => resolve(null);
      });

      document.body.appendChild(fileInput);
      fileInput.click();

      const selectedFile = await fileSelectionPromise;
      document.body.removeChild(fileInput);

      if (selectedFile) {
        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
          this.notificationService.addNotification(
            this.i18nService.getTranslation('admin.error.fileTooLarge'),
            'danger'
          );
          return;
        }

        // Validate file type
        if (!selectedFile.type.startsWith('image/')) {
          this.notificationService.addNotification(
            this.i18nService.getTranslation('admin.error.invalidFileType'),
            'danger'
          );
          return;
        }

        this.selectedImageFile = selectedFile;
        this.selectedImagePreview = await this.fileToBase64(selectedFile);
      }

    } catch (error) {
      console.error('Error selecting image:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('admin.error.imageSelectionFailed'),
        'danger'
      );
    }
  }

  /**
   * Remove selected image
   */
  removeImage() {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
  }

  /**
   * Convert file to base64 string
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
   * Edit an existing activity
   */
  async editActivity(activity: Activity) {
    // Implementation for editing activities
    // This would open a modal or navigate to an edit page
    this.notificationService.addNotification(
      this.i18nService.getTranslation('admin.info.editNotImplemented'),
      'info'
    );
  }

  /**
   * Toggle activity active/inactive status
   */
  async toggleActivityStatus(activity: Activity) {
    try {
      this.isLoading = true;
      
      activity.isActive = !activity.isActive;
      await this.activityService.updateActivity(activity);

      const statusKey = activity.isActive ? 'admin.success.activated' : 'admin.success.deactivated';
      this.notificationService.addNotification(
        this.i18nService.getTranslation(statusKey),
        'success'
      );

    } catch (error) {
      console.error('Error toggling activity status:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('admin.error.statusUpdateFailed'),
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Confirm and delete activity
   */
  async confirmDeleteActivity(activity: Activity) {
    const alert = await this.alertController.create({
      header: this.i18nService.getTranslation('admin.delete.title'),
      message: this.i18nService.getTranslation('admin.delete.message').replace('{title}', activity.title),
      buttons: [
        {
          text: this.i18nService.getTranslation('admin.delete.cancel'),
          role: 'cancel'
        },
        {
          text: this.i18nService.getTranslation('admin.delete.confirm'),
          role: 'destructive',
          handler: () => {
            this.deleteActivity(activity);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Delete an activity
   */
  private async deleteActivity(activity: Activity) {
    try {
      this.isLoading = true;
      
      await this.activityService.deleteActivity(activity.id);

      this.notificationService.addNotification(
        this.i18nService.getTranslation('admin.success.deleted'),
        'success'
      );

    } catch (error) {
      console.error('Error deleting activity:', error);
      this.notificationService.addNotification(
        this.i18nService.getTranslation('admin.error.deleteFailed'),
        'danger'
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Handle image load errors
   */
  onImageError(event: any) {
    event.target.src = 'https://picsum.photos/300/200';
  }

}
