import { DocumentData } from "@angular/fire/firestore";


export class UserPrivateProfile {
    public email?: string;
    public role: 'user' | 'admin' = 'user'; // User role for admin functionality
    public needsOnboarding: boolean = true; // Track if onboarding is needed

    
    constructor() {

    }
    
    static fromDB(data: DocumentData): UserPrivateProfile {
        let profile = new UserPrivateProfile();
        profile.email = data["email"];
        profile.role = data["role"] || 'user';
        profile.needsOnboarding = data["needsOnboarding"] !== undefined ? data["needsOnboarding"] : true;

        // Add any other fields you want to include in the private profile
        
        return profile;
    }

    toDB(): DocumentData {
        return {
            email: this.email || "",
            
            role: this.role,
            needsOnboarding: this.needsOnboarding,

            // Add any other fields you want to include in the private profile
        };
    }


}
