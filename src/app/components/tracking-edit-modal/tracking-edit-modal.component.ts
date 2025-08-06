import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  ModalController, 
  ToastController,
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
  IonTextarea,
  IonProgressBar,
  IonLabel,
  IonFooter,
  IonSpinner
} from '@ionic/angular/standalone';
import { Tracking } from 'src/app/core/models/tracking.model';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { StringFormat } from '@angular/fire/storage';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-tracking-edit-modal',
  templateUrl: './tracking-edit-modal.component.html',
  styleUrls: ['./tracking-edit-modal.component.scss'],
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
    IonTextarea,
    IonProgressBar,
    IonLabel,
    IonFooter,
    IonSpinner
  ]
})
export class TrackingEditModalComponent implements OnInit {

  @Input() tracking: Tracking | undefined;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  trackingForm!: FormGroup;
  selectedImage: string | null = null;
  uploadProgress: number = 0;
  uploadError: string | null = null;
  isLoading: boolean = false;
  metadata: any | null = null;

  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private trackingService: TrackingService,
    public notificationService: NotificationService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadTrackingData();
  }

  /**
   * Initializes the reactive form
   */
  private initializeForm() {
    this.trackingForm = this.formBuilder.group({
      notes: ['', [Validators.maxLength(500)]]
    });
  }

  /**
   * Loads existing tracking data into the form
   */
  private loadTrackingData() {
    console.log(this.tracking)
    if (this.tracking) {
      this.trackingForm.patchValue({
        notes: this.tracking.notes || ''
      });
      
      // Load existing image if available
      if (this.tracking.imageUrl) {
        this.selectedImage = this.tracking.imageUrl;
      }
    }
  }

  /**
   * Formats the duration of the tracking session
   */
  formatDuration(): string {
    if (!this.tracking || !this.tracking.startDate || !this.tracking.endDate) {
      return '0:00';
    }

    const duration = this.tracking.duration;
    const totalMinutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}h`;
    } else {
      return `${minutes}min`;
    }
  }

  /**
   * Triggers the file input click
   */
  triggerFileUpload(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.fileInput.nativeElement.click();
  }

  /**
   * Handles file selection from input
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file
    if (!this.validateFile(file)) {
      return;
    }

    // Read and preview the file
    this.readFileAsDataURL(file);
  }

  /**
   * Validates the selected file
   */
  private validateFile(file: File): boolean {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      this.uploadError = 'Nur JPG und PNG Dateien sind erlaubt.';
      this.notificationService.addNotification(this.uploadError, 'warning');
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      this.uploadError = 'Die Datei ist zu groß. Maximum: 5MB';
      this.notificationService.addNotification(this.uploadError, 'warning');
      return false;
    }

    this.uploadError = null;
    return true;
  }

  /**
   * Reads file as data URL for preview
   */
  private readFileAsDataURL(file: File) {
    const reader = new FileReader();
      let metadata = {
        contentType: file.type,
        name: file.name,
        size: file.size,
        
      } as any;
    reader.onload = (e) => {
      this.selectedImage = e.target?.result as string;
      this.metadata = metadata; // Store metadata for upload
    };

    reader.onerror = () => {
      this.uploadError = 'Fehler beim Lesen der Datei.';
      this.notificationService.addNotification(this.uploadError, 'danger');
    };

    reader.readAsDataURL(file);
  }

  /**
   * Call the UploadImage method from TrackingService to upload the selected image
   */
  private async uploadImage() {
    try {
      this.tracking!.imageUrl = await this.trackingService.uploadImage(this.selectedImage!, this.tracking!, this.metadata!);
    } catch (error) {
      console.error('Error uploading image:', error);
      await this.notificationService.addNotification("Fehler beim Hochladen des Bildes: " + error, 'danger');
    }
  }

  /**
   * Removes the selected image
   */
  removeImage(event: Event) {
    event.stopPropagation();
    this.selectedImage = null;
    this.uploadProgress = 0;
    this.uploadError = null;
    
    // Clear the file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /**
   * Saves the tracking with updated data
   */
  async saveTracking() {
    if (!this.tracking || this.trackingForm.invalid) {
      return;
    }

    this.isLoading = true;

    try {
      // Update tracking object
      const formData = this.trackingForm.value;
      this.tracking.notes = formData.notes;
      
      // If there's a new image, it would be uploaded here
      if (this.selectedImage && this.selectedImage !== this.tracking.imageUrl && this.metadata) {
        try {
          this.tracking.imageUrl = await this.trackingService.uploadImage(this.selectedImage, this.tracking, this.metadata);
        } catch (error) {
          this.uploadError = 'Fehler beim Hochladen des Bildes: ' + error;
          await this.notificationService.addNotification(this.uploadError, 'danger');
          return
        }
      }

      this.trackingService.saveToDB(this.tracking)

      await this.notificationService.addNotification('Tracking erfolgreich gespeichert!', 'success');
      this.modalController.dismiss(this.tracking, 'saved');

    } catch (error) {
      console.error('Error saving tracking:', error);
      this.uploadError = 'Fehler beim Speichern. Bitte versuche es erneut.';
      await this.notificationService.addNotification(this.uploadError, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Dismisses the modal without saving
   */
  dismiss() {
    this.modalController.dismiss(null, 'cancelled');
  }
}