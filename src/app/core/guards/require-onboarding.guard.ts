import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';

export const requireOnboardingGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.$currentUserPrivateProfile.pipe(
    map(userPrivateProfile => {
        console.log("User private profile:", userPrivateProfile);
      if (!userPrivateProfile) {
        // If no user is logged in, redirect to login
        return true
      }
        // Check if user has completed onboarding
        if (userPrivateProfile.needsOnboarding) {
          // User hasn't completed onboarding, redirect to onboarding
          router.navigate(['/onboarding']);
          return false;
        } else {
          // User has completed onboarding, allow access
          return true;
        }
      }
    )
  );
};
