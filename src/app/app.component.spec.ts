import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { createFirebaseTestingModule } from '../testing/firebase-testing-utils';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the app', async () => {
    const firebaseModule = createFirebaseTestingModule();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), ...firebaseModule.providers],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
