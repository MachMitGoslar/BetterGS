import { Component, OnInit, Input } from '@angular/core';
import { ElapsedTimePipe } from 'src/app/core/pipes/elapsed-time.pipe';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-activity-card',
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss'],
  imports: [ElapsedTimePipe, IonIcon],
})
export class ActivityCardComponent {
  @Input() icon: string = 'time';
  @Input() value: string = ''; // in seconds

  constructor() {}
}
