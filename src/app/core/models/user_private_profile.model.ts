import { DocumentData } from '@angular/fire/firestore';
import { Device } from '@capacitor/device';

export class UserPrivateProfile {
  public email?: string;
  public role: 'user' | 'admin' = 'user'; // User role for admin functionality
  public needsOnboarding: boolean = true; // Track if onboarding is needed

  constructor() {}

  static async fromDB(data: DocumentData): Promise<UserPrivateProfile> {
    let profile = new UserPrivateProfile();
    profile.email = data['email'];
    profile.role = data['role'] || 'user';
    let device_id = (await Device.getId()).identifier;
    let onboarding_array = Array.isArray(data['needsOnboarding'])
      ? data['needsOnboarding']
      : [];
    if (onboarding_array.find((id: string) => id === device_id)) {
      profile.needsOnboarding = false;
    } else {
      profile.needsOnboarding = true;
    }

    // Add any other fields you want to include in the private profile

    return profile;
  }

  toDB(): DocumentData {
    return {
      email: this.email || '',

      role: this.role,

      // Add any other fields you want to include in the private profile
    };
  }
}
