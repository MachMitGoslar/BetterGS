import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationComponent } from './components/notification/notification.component';
import { ApplicationService } from './core/services/application.service';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, NotificationComponent],
})
export class AppComponent implements OnInit {
  public appService = inject(ApplicationService);

  constructor() {}

  async ngOnInit() {
    // Hide the splash (you should do this on app launch)
    await SplashScreen.hide({});

    // Show the splash for two seconds and then automatically hide it:
    await SplashScreen.show({
      fadeInDuration: 200,
      fadeOutDuration: 200,
      showDuration: 2000,
      autoHide: true,
    });
  }
}
