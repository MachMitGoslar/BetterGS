import { DocumentData } from "@angular/fire/firestore";


export class UserPrivateProfile {
    public email?: string;
    public role: 'user' | 'admin' = 'user'; // User role for admin functionality

    
    constructor() {

    }
    
    static fromDB(data: DocumentData): UserPrivateProfile {
        let profile = new UserPrivateProfile();
        profile.email = data["email"];
        // Add any other fields you want to include in the private profile
        
        return profile;
    }

    toDB(): DocumentData {
        return {
            email: this.email || "",
            role: this.role,
            // Add any other fields you want to include in the private profile
        };
    }


}
