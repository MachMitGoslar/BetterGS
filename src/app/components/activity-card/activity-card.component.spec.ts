import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ActivityCardComponent } from './activity-card.component';
import {
  createTestingEnvironment,
  TestInteractions,
} from 'src/testing/shared-testing-config';

describe('ActivityCardComponent', () => {
  let component: ActivityCardComponent;
  let fixture: ComponentFixture<ActivityCardComponent>;
  let testEnv: any;

  beforeEach(waitForAsync(() => {
    testEnv = createTestingEnvironment();

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ActivityCardComponent],
      providers: [...testEnv.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.icon).toBe('time');
    expect(component.value).toBe('');
  });

  it('should accept custom icon and value inputs', () => {
    component.icon = 'star';
    component.value = '120';

    expect(component.icon).toBe('star');
    expect(component.value).toBe('120');
  });

  it('should render with provided inputs', () => {
    component.icon = 'trophy';
    component.value = '300';
    fixture.detectChanges();

    // Verify component has updated properties
    expect(component.icon).toBe('trophy');
    expect(component.value).toBe('300');
  });
});
