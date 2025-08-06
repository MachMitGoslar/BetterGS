import { DocumentData, documentId, DocumentReference, getDoc, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4, v4 } from 'uuid';



export class Tracking {

    public id: string;
    public startDate?: Date
    public endDate?: Date 
    public notes: string = "";
    public imageUrl?: string;
    public ref?: DocumentReference;
    public userRef?: DocumentReference;
    public activityRef?: DocumentReference
    public is_active: boolean = false;
    

    constructor(id = documentId().toString(), userRef: DocumentReference, activityRef: DocumentReference) {
        this.id = id;
        this.userRef = userRef;
        this.activityRef = activityRef;
    }

    static fromDBData(id: string, data: DocumentData): Tracking {

        const tracking = new Tracking(id, data["userRef"], data["activityRef"]);
        tracking.id = id
        tracking.startDate = data["startDate"].toDate();
        tracking.endDate = data["endDate"].toDate();
        tracking.notes = data["notes"];
        tracking.imageUrl = data["imageUrl"] || undefined;

        return tracking;
    }

    static fromDBRef(ref: DocumentReference): Promise<Tracking | undefined> {
        let promise = new Promise<Tracking | undefined>( (resolve, reject) => {
        if (ref === undefined || ref === null) {
            reject(new Error("Reference is required to fetch tracking data."));
            return;
        }

        getDoc(ref).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                const tracking = new Tracking(data["id"], data["userRef"], data["activityRef"]);
                tracking.id = data["id"];
                tracking.startDate = data["startDate"].toDate();
                tracking.endDate = data["endDate"].toDate();
                tracking.imageUrl = data["imageUrl"] || undefined;
                tracking.notes = data["notes"];
                resolve(tracking);
            } else {
                reject(new Error("Tracking data not found."));
            }
        }, error => reject(error));

    });
    return promise;
    }


    toDB(): DocumentData {
        return(
            {
                id: this.id,
                startDate: this.startDate ? Timestamp.fromDate(this.startDate) : null,
                endDate: this.endDate ? Timestamp.fromDate(this.endDate) : null,
                notes: this.notes,
                duration: this.duration,
                activityRef: this.activityRef ? this.activityRef : null,
                userRef: this.userRef ? this.userRef : null,
                imageUrl: this.imageUrl ? this.imageUrl : null}
        )
    }

    /**
     * Calculates the duration in milliseconds between `startDate` and `endDate`.
     * - If `startDate` is not set, returns 0.
     * - If `endDate` is not set and the tracking is active (`is_active` is true), uses the current time as `endDate`.
     * - If `endDate` is not set and tracking is not active, returns 0.
     * - If the calculated duration exceeds 3 hours (in milliseconds), returns the maximum allowed duration (3 hours) and logs a warning.
     * 
     * @returns The duration in milliseconds between `startDate` and `endDate`, capped at 3 hours.
     */
    get duration(): number {
        if(!this.startDate) {
            return 0; // or throw an error if you prefer
        }
        if(!this.endDate && this.is_active) {
            this.endDate = new Date(); // If endDate is not set, use current time
        } else if(!this.endDate) {
            return 0; // If not active and no endDate, return 0
        }
        const max_time = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
        if((this.endDate.getTime() - this.startDate.getTime()) > max_time) {
            console.warn('Tracking duration exceeded 3 hours, returning 0');
            return max_time;
        }


        return this.endDate.getTime() - this.startDate.getTime();

    }

    static startTracking(activityRef: DocumentReference, user: DocumentReference): Tracking {
        let tracking = new Tracking(uuidv4(), user, activityRef);
        tracking.is_active = true;
        tracking.startDate = new Date();
        return tracking;
    }
}