import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createFirebaseTestingModule } from '../../../testing/firebase-testing-utils';
import { AdminPagePage } from './admin-page.page';

describe('AdminPagePage', () => {
  let component: AdminPagePage;
  let fixture: ComponentFixture<AdminPagePage>;

  beforeEach(async () => {
    const firebaseModule = createFirebaseTestingModule();
    await TestBed.configureTestingModule({
      imports: [AdminPagePage],
      providers: [...firebaseModule.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
