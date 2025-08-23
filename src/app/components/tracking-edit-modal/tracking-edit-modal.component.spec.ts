import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';

import { TrackingEditModalComponent } from './tracking-edit-modal.component';

describe('TrackingEditModalComponent', () => {
  let component: TrackingEditModalComponent;
  let fixture: ComponentFixture<TrackingEditModalComponent>;

  beforeEach(waitForAsync(() => {
    const firebaseModule = createFirebaseTestingModule();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), TrackingEditModalComponent],
      providers: [...firebaseModule.providers, ModalController],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackingEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
