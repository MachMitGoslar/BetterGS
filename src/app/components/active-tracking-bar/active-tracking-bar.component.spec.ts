import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { createTestingEnvironment } from '../../../testing/shared-testing-config';

import { ActiveTrackingBarComponent } from './active-tracking-bar.component';

describe('ActiveTrackingBarComponent', () => {
  let component: ActiveTrackingBarComponent;
  let fixture: ComponentFixture<ActiveTrackingBarComponent>;

  beforeEach(waitForAsync(() => {
    const testEnv = createTestingEnvironment();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ActiveTrackingBarComponent],
      providers: [...testEnv.providers, ModalController],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveTrackingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
