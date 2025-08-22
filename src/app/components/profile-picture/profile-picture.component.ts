import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss'],
  imports: [IonIcon, CommonModule],
})
export class ProfilePictureComponent {
  @Input() pictureUrl: string | undefined;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  constructor() {}
}
