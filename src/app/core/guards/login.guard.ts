import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ApplicationService } from '../services/application.service';
import { catchError, map, of, take } from 'rxjs';
import { UserService } from '../services/user.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.$currentUser.pipe(
    take(1),
    map((user) => {
      console.log('LoginGuard: Checking user authentication status', user);
      if (user && user !== null && user !== undefined) {
        return true; // User is logged in, allow access
      } else {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false; // User is not logged in, redirect to login page
      }
    }),
    catchError((error) => {
      console.error(
        'LoginGuard: Error checking user authentication status',
        error
      );
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return of(false); // On error, redirect to login page
    })
  );
};
