import { bootstrapApplication } from '@angular/platform-browser';
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

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
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
        connectAuthEmulator(
          auth,
          `http://${environment.emulatorConfig.host}:9100`
        );
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
