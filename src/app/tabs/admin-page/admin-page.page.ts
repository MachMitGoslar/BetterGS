/**
 * Icon definitions for activity selection
 * This constant should be moved to a separate configuration file in a future refactor
 */
const ICON_LIST = {
  // TODO: Move to proper icon configuration service
}

import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
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
  receipt, warningOutline, fitnessOutline, peopleOutline, timeOutline, trendingUpOutline, addCircleOutline, imageOutline, addOutline, listOutline, pauseOutline, calendarOutline, createOutline, trashOutline } from 'ionicons/icons';

import { User } from '@angular/fire/auth';
import { Activity } from 'src/app/core/models/activity.model';
import { ApplicationService } from 'src/app/core/services/application.service';
import { ActivityService } from 'src/app/core/services/activity.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { I18nService } from 'src/app/core/services/i18n.service';
import { I18nPipe } from 'src/app/core/pipes/i18n.pipe';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';
import { UserService } from 'src/app/core/services/user.service';

/**
 * AdminPagePage Component
 * 
 * This component provides a comprehensive admin interface for managing activities,
 * users, and viewing application statistics. It includes:
 * 
 * Features:
 * - Activity creation, editing, and deletion
 * - Activity status management (active/inactive)
 * - Image upload for activities
 * - Icon selection for activities
 * - Real-time statistics dashboard
 * - User permission validation
 * - Responsive design for mobile and desktop
 * 
 * Architecture:
 * - Uses ApplicationService for unified notification handling
 * - Implements reactive forms for data validation
 * - Manages subscriptions properly to prevent memory leaks
 * - Follows Ionic Angular standalone component patterns
 * 
 * @author BetterGS Development Team
 * @version 1.0.0
 * @since 2025-08-22
 */

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

  // ========================================
  // COMPONENT PROPERTIES
  // ========================================

  /**
   * Current authenticated user
   * @description Holds the reference to the currently logged-in user
   */
  currentUser: User | null = null;

  /**
   * Admin permission flag
   * @description Indicates if the current user has admin privileges
   */
  isAdmin: boolean = false;

  /**
   * Activity creation/editing form
   * @description Reactive form for managing activity data with validation
   */
  activityForm!: FormGroup;

  /**
   * Loading state indicator
   * @description Shows loading spinner during async operations
   */
  isLoading: boolean = false;
  
  /**
   * Complete list of activities from the database
   * @description Master array containing all activities
   */
  activities: Activity[] = [];

  /**
   * Filtered activities based on search criteria
   * @description Subset of activities matching the current search term
   */
  filteredActivities: Activity[] = [];

  /**
   * Current search term for activity filtering
   * @description User input for filtering activities by title or description
   */
  searchTerm: string = '';

  /**
   * Currently selected icon for activity creation/editing
   * @description Icon identifier that will be stored with the activity
   */
  selectedIcon: string = 'fitness';

  /**
   * Selected image file for activity
   * @description File object for the activity image to be uploaded
   */
  selectedImageFile: File | null = null;

  /**
   * Preview URL for selected image
   * @description Data URL for displaying image preview before upload
   */
  selectedImagePreview: string | null = null;

  /**
   * Icon picker modal visibility state
   * @description Controls the display of the icon selection modal
   */
  showIconPicker: boolean = false;

  // ========================================
  // DASHBOARD STATISTICS
  // ========================================

  /**
   * Total number of activities in the system
   * @description Real-time count of all activities
   */
  totalActivities: number = 0;

  /**
   * Total number of registered users
   * @description Real-time count of all users (placeholder)
   */
  totalUsers: number = 0;

  /**
   * Total tracking time across all users
   * @description Cumulative time tracked in the system (placeholder)
   */
  totalTrackingTime: number = 0;

  /**
   * Number of currently active tracking sessions
   * @description Real-time count of ongoing tracking sessions (placeholder)
   */
  activeTrackings: number = 0;

  /**
   * Available icons for activity selection
   * @description Predefined list of icons that users can choose from for activities
   * @todo Consider moving this to a configuration service for better maintainability
   */
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

  /**
   * Array to store component subscriptions
   * @description Manages all observable subscriptions to prevent memory leaks
   * @private
   */
  private subscriptions: Subscription[] = [];

  // ========================================
  // CONSTRUCTOR & DEPENDENCY INJECTION
  // ========================================

  /**
   * Constructor for AdminPagePage
   * 
   * @param formBuilder - Angular reactive forms builder for form creation
   * @param applicationService - Main application service for business logic and notifications
   * @param activityService - Service for activity data operations
   * @param userService - Service for user management and authentication
   * @param notificationService - Service for displaying user notifications
   * @param i18nService - Internationalization service for translations
   * @param alertController - Ionic alert controller for confirmation dialogs
   * @param actionSheetController - Ionic action sheet controller for action menus
   */

    private formBuilder = inject(FormBuilder);
    private applicationService = inject(ApplicationService);
    private activityService = inject(ActivityService);
    private userService = inject(UserService);
    private notificationService = inject(NotificationService);
    private i18nService = inject(I18nService);
    private alertController = inject(AlertController);

  constructor(

  ) {
    this.initializeForm();
    this.setupIcons();
  }

  // ========================================
  // LIFECYCLE HOOKS
  // ========================================

  /**
   * Component initialization lifecycle hook
   * @description Initializes component data and sets up subscriptions
   * @implements OnInit
   */
  ngOnInit(): void {
    this.loadUserData();
    this.loadActivities();
    this.loadStatistics();
  }

  /**
   * Component destruction lifecycle hook
   * @description Cleans up subscriptions to prevent memory leaks
   * @implements OnDestroy
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========================================
  // INITIALIZATION METHODS
  // ========================================

  /**
   * Initialize the reactive form for activity creation and editing
   * @description Sets up form structure with validation rules
   * @private
   */
  private initializeForm(): void {
    this.activityForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  /**
   * Setup ionicons for the component
   * @description Registers all required icons with the Ionic icon registry
   * @private
   */
  private setupIcons(): void {
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

  // ========================================
  // DATA LOADING METHODS
  // ========================================

  /**
   * Load current user data and check admin permissions
   * @description Sets up subscriptions for user authentication and permission status
   * @private
   */
  private loadUserData(): void {
    const userSub = this.applicationService.$currentUser.subscribe((user) => {
      this.currentUser = user;
    });

    const isAdminSub = this.userService.$currentUserPrivateProfile.subscribe((isAdmin) => {
      this.isAdmin = isAdmin?.role === 'admin' || false;
    });

    this.subscriptions.push(userSub);
    this.subscriptions.push(isAdminSub);
  }

  /**
   * Load activities data from the service
   * @description Sets up subscription for real-time activity updates
   * @private
   */
  private loadActivities(): void {
    const activitiesSub = this.activityService.$activities.subscribe(activities => {
      this.activities = activities;
      this.filterActivities();
    });
    this.subscriptions.push(activitiesSub);
  }

  /**
   * Load dashboard statistics
   * @description Calculates and displays various metrics for the admin dashboard
   * @private
   * @todo Implement proper statistics from backend services
   */
  private loadStatistics(): void {
    // Total activities count
    const activitiesSub = this.activityService.$activities.subscribe(activities => {
      this.totalActivities = activities.length;
    });
    this.subscriptions.push(activitiesSub);

    // TODO: Implement proper statistics from backend services
    this.totalUsers = 0; // Would come from user service
    this.totalTrackingTime = 0; // Would come from tracking service  
    this.activeTrackings = 0; // Would come from tracking service
  }

  // ========================================
  // ACTIVITY FILTERING & SEARCH
  // ========================================

  /**
   * Filter activities based on search term
   * @description Filters activities by title and description matching the search term
   * @public Used by template for real-time search
   */
  filterActivities(): void {
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

  // ========================================
  // ACTIVITY MANAGEMENT METHODS
  // ========================================

  /**
   * Create a new activity
   * @description Validates form data, handles image upload, and creates activity via ApplicationService
   * @public Called from template
   * @throws Will display error notification if creation fails
   */
  async createActivity(): Promise<void> {
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

      // Save to database using ApplicationService (handles notifications)
      await this.applicationService.createActivity(newActivity);

      // Reset form
      this.resetForm();

    } catch (error) {
      console.error('Error creating activity:', error);
      // ApplicationService already handles error notifications
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Edit an existing activity
   * @description Placeholder method for future activity editing functionality
   * @param activity - The activity to edit
   * @public Called from template
   * @todo Implement full activity editing functionality
   */
  async editActivity(activity: Activity): Promise<void> {
    this.notificationService.addNotification(
      this.i18nService.getTranslation('admin.info.editNotImplemented'),
      'info'
    );
  }

  /**
   * Toggle activity active/inactive status
   * @description Switches the active state of an activity and saves it
   * @param activity - The activity to toggle
   * @public Called from template
   * @throws Will display error notification if update fails
   */
  async toggleActivityStatus(activity: Activity): Promise<void> {
    try {
      this.isLoading = true;
      
      activity.isActive = !activity.isActive;
      // Use ApplicationService for unified notification handling
      await this.applicationService.updateActivity(activity);

    } catch (error) {
      console.error('Error toggling activity status:', error);
      // ApplicationService already handles error notifications
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Confirm and delete activity with user confirmation
   * @description Shows confirmation dialog before deleting an activity
   * @param activity - The activity to delete
   * @public Called from template
   */
  async confirmDeleteActivity(activity: Activity): Promise<void> {
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
   * @description Removes an activity from the system via ApplicationService
   * @param activity - The activity to delete
   * @private Called by confirmDeleteActivity
   * @throws Will display error notification if deletion fails
   */
  private async deleteActivity(activity: Activity): Promise<void> {
    try {
      this.isLoading = true;
      
      // Use ApplicationService for unified notification handling
      await this.applicationService.deleteActivity(activity.id);

    } catch (error) {
      console.error('Error deleting activity:', error);
      // ApplicationService already handles error notifications
    } finally {
      this.isLoading = false;
    }
  }

  // ========================================
  // FORM MANAGEMENT METHODS
  // ========================================

  /**
   * Reset the activity creation form
   * @description Clears all form fields and resets file selections
   * @private Called after successful activity creation
   */
  private resetForm(): void {
    this.activityForm.reset();
    this.selectedIcon = 'fitness';
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
  }

  // ========================================
  // ICON SELECTION METHODS
  // ========================================

  /**
   * Open icon picker modal
   * @description Shows the icon selection modal for activity icons
   * @public Called from template
   */
  openIconPicker(): void {
    this.showIconPicker = true;
  }

  /**
   * Select an icon for the activity
   * @description Sets the selected icon and closes the picker modal
   * @param iconName - The name of the selected icon
   * @public Called from template
   */
  selectIcon(iconName: string): void {
    this.selectedIcon = iconName;
    this.showIconPicker = false;
    console.log('Selected icon:', this.selectedIcon);
  }

  // ========================================
  // IMAGE MANAGEMENT METHODS
  // ========================================

  /**
   * Select image file for activity
   * @description Opens file picker and handles image selection with preview
   * @public Called from template
   * @throws Will display error notification if image processing fails
   */
  async selectImage(): Promise<void> {
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
   * @description Clears the selected image file and preview
   * @public Called from template
   */
  removeImage(): void {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
  }

  /**
   * Convert file to base64 string
   * @description Converts a File object to a base64 encoded string for upload
   * @param file - The file to convert
   * @returns Promise resolving to base64 string
   * @private Used internally for image processing
   * @throws Will reject if file conversion fails
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

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Handle image load errors
   * @description Provides fallback image when activity image fails to load
   * @param event - The error event from the image element
   * @public Called from template
   */
  onImageError(event: any): void {
    event.target.src = 'https://picsum.photos/300/200';
  }
}
