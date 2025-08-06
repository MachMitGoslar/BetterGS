import { UserProfile } from '@angular/fire/auth';
import { doc, DocumentData, documentId, DocumentReference, serverTimestamp, Timestamp } from 'firebase/firestore';
import { User as FirestoreUser } from '@angular/fire/auth';
import { generateRandomProfileName } from './user_public_profile.model';



export class User {

    

    public firestoreUser: FirestoreUser | undefined;
    public id: string;
    public name: string;
    public email: string = "";
    public createdAt: Date = new Date();
    public updatedAt: Date = new Date();
    public isActive: boolean = true;
    public pictureUrl: string = "";

    public activity_duration: number = 0; // Total time spent on activities
    public total_trackings: number = 0; // Total number of trackings
    public role: 'user' | 'admin' = 'user'; // User role for admin functionality


    constructor(id = documentId().toString()) {
        this.id = id;
        this.name = generateRandomProfileName();
    }

    static fromDB(fs_user: FirestoreUser, data: DocumentData): User {
        let user = new User();
        user.firestoreUser = fs_user;
        user.id = fs_user.uid;
        user.name = data["name"] || generateRandomProfileName();
        user.email = fs_user.email || "anonymous";
        user.createdAt = data["createdAt"]?.toDate() ?? new Date();
        user.updatedAt = data["updatedAt"]?.toDate() ?? new Date();
        user.isActive = data["isActive"] ?? true;
        user.pictureUrl = data["pictureUrl"] ?? "";
        user.activity_duration = data["activity_duration"] || 0; // Default to 0 if not provided
        user.total_trackings = data["total_trackings"] || 0; // Default to
        user.role = data["role"] || 'user'; // Default to 'user' role
        return user;
    }

    toDB(creation = false): DocumentData {
        let user_object: DocumentData = {
            id: this.id,
            name: this.name,
            updatedAt: Timestamp.fromDate(this.updatedAt),
            isActive: this.isActive,
            pictureUrl: this.pictureUrl,
            role: this.role
        };
        if (creation) {
            user_object['createdAt'] = serverTimestamp();
        }
        return user_object;
    }

    get path(): string {
        return "users/" + this.id;
    }

    get days_active(): number {
        if (!this.createdAt) return 0;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    }
}