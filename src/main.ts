import { bootstrapApplication } from '@angular/platform-browser';
import { ErrorHandler } from '@angular/core';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { IconService } from './app/core/services/icon.service';
import { GlobalErrorHandler } from './app/core/handlers/global-error.handler';
import {
  getFirestore,
  provideFirestore,
  initializeFirestore,
  connectFirestoreEmulator,
} from '@angular/fire/firestore';
import {
  getAuth,
  provideAuth,
  connectAuthEmulator,
  initializeAuth,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
} from '@angular/fire/auth';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  provideStorage,
  getStorage,
  connectStorageEmulator,
} from '@angular/fire/storage';
import { environment } from './environments/environment';
//import { defineCustomElements } from '@ionic/pwa-elements/loader';
// Call the element loader before the bootstrapModule/bootstrapApplication call
//defineCustomElements(window);

// Ensure IconService is instantiated at app startup
const iconService = new IconService();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => {
      return initializeApp(environment.firebaseConfig);
    }),

    provideAuth(() => {
      let auth = initializeAuth(getApp(), {
        persistence: !environment.production
          ? browserSessionPersistence
          : indexedDBLocalPersistence,
        // popupRedirectResolver: browserPopupRedirectResolver,
      });
      if (!environment.production) {
        /*connectAuthEmulator(
          auth,
          `http://${environment.emulatorConfig.host}:9100`
        );*/
      }
      return auth;
    }),
    provideFirestore(() => {
      let firestore = initializeFirestore(
        getApp(),
        {
          // experimentalForceLongPolling: !environment.production ? true : false,
        },
        'staging'
      );
      if (!environment.production) {
        connectFirestoreEmulator(
          firestore,
          environment.emulatorConfig.host,
          8112
        );
      }
      return firestore;
    }),
    provideStorage(() => {
      let storage = getStorage(getApp());
      if (!environment.production) {
        connectStorageEmulator(storage, environment.emulatorConfig.host, 9199);
      }
      return storage;
    }),
  ],
});
