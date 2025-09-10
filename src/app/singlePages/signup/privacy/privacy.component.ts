import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonTitle,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  standalone: true,
  imports: [
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon
  ],
})
export class PrivacyComponent implements OnInit {
  public modalController = inject(ModalController)
  constructor() {}

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss();
  }
}
