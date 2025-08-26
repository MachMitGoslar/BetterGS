import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { createTestingEnvironment } from '../testing/shared-testing-config';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the app', async () => {
    const testEnv = createTestingEnvironment();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), ...testEnv.providers],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
