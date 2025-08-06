import { Component, EnvironmentInjector, inject } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel, IonTab } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  stopwatch,
  trophy,
  person,
  settings
 } from 'ionicons/icons';
import { ActiveTrackingBarComponent } from '../components/active-tracking-bar/active-tracking-bar.component';
import { ApplicationService } from '../core/services/application.service';
import { User } from '../core/models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [ 
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    CommonModule
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  public currentUser: User | null = null;

  constructor(
    public applicationService: ApplicationService,
  ) {
    this.applicationService.$currentUser.subscribe(user => {
      this.currentUser = user;
    });

    addIcons({   stopwatch,
  trophy,
  person,
  settings });
  }
}
