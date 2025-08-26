import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { TrackingEditModalComponent } from './tracking-edit-modal.component';
import { createTestingEnvironment } from 'src/testing/shared-testing-config';

describe('TrackingEditModalComponent', () => {
  let component: TrackingEditModalComponent;
  let fixture: ComponentFixture<TrackingEditModalComponent>;

  beforeEach(waitForAsync(() => {
    const testEnv = createTestingEnvironment();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TrackingEditModalComponent],
      providers: [...testEnv.providers, ModalController],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
