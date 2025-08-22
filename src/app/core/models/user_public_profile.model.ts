import { DocumentData, DocumentReference, serverTimestamp, Timestamp } from "@angular/fire/firestore";
import { server } from "ionicons/icons";
import { adjectives, animals, Config, uniqueNamesGenerator } from "unique-names-generator";

export class UserPublicProfile {
    public id?: string;
    public userRef?: DocumentReference;
    public name: string ="";
    public createdAt?: Date;
    public trackedTime: number = 0;
    public trackedActivities: number = 0; // Assuming this field exists in the database
    public total_trackings: number =  0; // Assuming this field exists in the database
    public profilePictureUrl?: string;
    public updatedAt?: Date;
    public isActive: boolean = true; // Indicates if the user is currently active
    
    constructor( ) {
    
    }
    
    static fromDB(id: string, data: DocumentData): UserPublicProfile {
        console.log("Converting UserPublicProfile from DB format:", data);
        let profile = new UserPublicProfile();
        profile.id = id;
        profile.name = data["name"];
        profile.createdAt = data["createdAt"]?.toDate() || new Date();
        profile.trackedTime = data["trackedTime"];
        profile.trackedActivities = data["trackedActivities"] || 0;
        profile.total_trackings = data["total_trackings"] || 0; // Assuming this field exists
        profile.profilePictureUrl = data["profilePictureUrl"];
        profile.updatedAt = data["updatedAt"]?.toDate() || new Date();
        profile.isActive = data["isActive"];

        return profile;
    }

    toDB(): DocumentData {
        let data = {
            name: this.name || generateRandomProfileName(),
            createdAt: Timestamp.fromDate(this.createdAt || new Date()),
            trackedTime: this.trackedTime || 0,
            profilePictureUrl: this.profilePictureUrl || "",
            updatedAt: serverTimestamp(),
            isActive: this.isActive
        };
        console.log("Converting UserPublicProfile to DB format:", data);
        return data;
    }


}

export function generateRandomProfileName(): string {
        const config: Config = {
            dictionaries: [adjectives, animals],
            separator: ' ',
            length: 2,
            style: 'capital'

        };
        return uniqueNamesGenerator(config);
    }
