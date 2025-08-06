import { DocumentData } from "@angular/fire/firestore";
import { Activity } from "./activity.model";
import { adjectives, animals, Config, uniqueNamesGenerator } from "unique-names-generator";

export class UserPublicProfile {
    public id: string;
    public name: string;
    public createdAt?: Date;
    public trackedTime?: number;
    public profilePictureUrl?: string;
    public trackedActivities?: Activity[]
    
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;    
    }
    
    static fromDB(data: DocumentData): UserPublicProfile {
        let profile = new UserPublicProfile(
            data["id"],
            data["name"] ?? generateRandomProfileName() // Generate a random name if not provided
        );
        profile.createdAt = data["createdAt"];
        profile.trackedTime = data["trackedTime"];
        profile.profilePictureUrl = data["profilePictureUrl"];
        profile.trackedActivities = data["trackedActivities"];
        return profile;
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
