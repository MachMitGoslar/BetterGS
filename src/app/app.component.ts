import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationComponent } from "./components/notification/notification.component";
import { ApplicationService } from './core/services/application.service';
import { ActiveTrackingBarComponent } from "./components/active-tracking-bar/active-tracking-bar.component";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, NotificationComponent],
})

export class AppComponent {
  public appService = inject(ApplicationService);

  constructor() {}
}
