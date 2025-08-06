import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { browserPopupRedirectResolver, browserSessionPersistence, connectAuthEmulator, indexedDBLocalPersistence, initializeAuth } from '@firebase/auth';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectFirestoreEmulator, initializeFirestore } from '@firebase/firestore';
import { connectStorageEmulator, getStorage } from "@firebase/storage";
import { provideStorage } from "@angular/fire/storage";
import { environment } from './environments/environment';
import { setLogLevel, LogLevel } from "@angular/fire";
import { defineCustomElements } from '@ionic/pwa-elements/loader';
// Call the element loader before the bootstrapModule/bootstrapApplication call
defineCustomElements(window);


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)), 
    provideFirebaseApp(() =>  initializeApp(environment.firebaseConfig)),

    provideAuth(() => {
      let auth = initializeAuth(getApp(), {
                    persistence: !environment.production
                        ? browserSessionPersistence
                        : indexedDBLocalPersistence,
                    popupRedirectResolver: browserPopupRedirectResolver
                });
        if(!environment.production) {
          connectAuthEmulator(auth, `http://${environment.emulatorConfig.host}:9100`)
        }
      return auth;
    }
    ), 
    provideFirestore(() => {
      let firestore = initializeFirestore(getApp(), {
        experimentalForceLongPolling: !environment.production ? true : false,
      });
      if(!environment.production) {
       connectFirestoreEmulator(firestore, environment.emulatorConfig.host, 8112);
      }
      return firestore
    })
    ,
    provideStorage(() => {
      let storage = getStorage(getApp());
      if(!environment.production) {
        connectStorageEmulator(storage, environment.emulatorConfig.host, 9199);
      }
      return storage;
    })
  ],
});
