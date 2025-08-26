import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { configureStandaloneComponentTest, createTestingEnvironment } from '../../../../testing/shared-testing-config';

import { ActivityItemComponent } from './activity-item.component';

describe('ActivityItemComponent', () => {
  let component: ActivityItemComponent;
  let fixture: ComponentFixture<ActivityItemComponent>;

  beforeEach(waitForAsync(async () => {
    await configureStandaloneComponentTest(ActivityItemComponent);

    let testEnv = createTestingEnvironment();
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ActivityItemComponent],
      providers: testEnv.providers,
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
