import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const applicationService = inject(ApplicationService);

  return applicationService.$currentUser.pipe(
    map((user) => {
      if (user && user !== null && user.privateProfile.role === 'admin') {
        return true; // User is logged in, allow access
      } else {
        console.log("ROUTING");
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false; // User is not logged in, redirect to login page
      }
    })
  );

};
