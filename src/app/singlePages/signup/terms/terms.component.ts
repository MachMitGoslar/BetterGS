import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonTitle,
  IonHeader,
  IonToolbar,
  IonButton,
  IonButtons,
  ModalController,
} from '@ionic/angular/standalone';
import { I18nPipe } from 'src/app/core/pipes/i18n.pipe';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  standalone: true,
  imports: [
    IonTitle,
    IonIcon,
    IonContent,
    IonCard,
    IonHeader,
    IonCardContent,
    I18nPipe,
    IonToolbar,
    IonButton,
    IonButtons,
  ],
})
export class TermsComponent {
  public modalController = inject(ModalController);
  constructor() {}

  dismiss() {
    this.modalController.dismiss();
  }
}
