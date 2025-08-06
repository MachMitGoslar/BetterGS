import { Component, Input, OnInit } from '@angular/core';
import { Activity } from 'src/app/core/models/activity.model';
import { ActivityItemComponent } from './activity-item/activity-item.component';
import { IonList, IonItem, IonLabel } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss'],
  imports: [IonList,  ActivityItemComponent, CommonModule] // Add necessary imports if needed
})
export class ActivityListComponent  implements OnInit {

  @Input() activities: Activity[] = []; // Replace 'any' with the appropriate type for your activities

  constructor() { }

  ngOnInit() {
    this.activities = this.activities.sort((a, b) => {
        // Sort by timeSpend in descending order
      return b.timeSpend - a.timeSpend;
    });

  }

}
