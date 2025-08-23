import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { createFirebaseTestingModule } from '../../testing/firebase-testing-utils';

import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(async () => {
    const firebaseModule = createFirebaseTestingModule();
    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [provideRouter([]), ...firebaseModule.providers],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
