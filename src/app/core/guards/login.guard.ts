import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ApplicationService } from '../services/application.service';
import { map } from 'rxjs';




export const loginGuard: CanActivateFn = (route, state) => {
  const applicationService = inject(ApplicationService);
  const router = inject(Router);
  console.log('Login Guard: Checking user authentication status');

  return applicationService.$currentUser.pipe(
    map((user) => {
      if (user && user !== null) {
        return true; // User is logged in, allow access
      } else {
        console.log("ROUTING");
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false; // User is not logged in, redirect to login page
      }
    })
  );
};
