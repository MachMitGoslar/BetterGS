import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApplicationService } from '../services/application.service';
import { map } from 'rxjs';
import { UserService } from '../services/user.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  return userService.$currentUserPrivateProfile.pipe(
    map((profile) => {
      if (profile && profile !== null && profile.role === 'admin') {
        return true; // User is logged in, allow access
      } else {
        console.log('ROUTING');
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false; // User is not logged in, redirect to login page
      }
    })
  );
};
