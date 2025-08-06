import { inject } from '@angular/core';
import { docData, Firestore } from '@angular/fire/firestore';
import { doc, DocumentData, documentId, DocumentReference, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { server } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { v4 } from 'uuid';



export class Activity {

    public id: string
    public title: string = ""
    public description: string = ""
    public createdAt: Date = new Date()
    public updatedAt: Date = new Date()
    public isActive: boolean = true
    public ref?: DocumentReference
    public icon: string = "add" // Default icon, can be overridden
    public imageUrl: string = "https://picsum.photos/700/400"; // Optional image URL
    public timeSpend: number = 0; // Time spent in seconds
    public is_active: boolean = false; // Indicates if the activity is currently active



  constructor(
    id = v4() // Using v4() to generate a unique ID
  ) {
    console.log("Creating new Activity instance with ID:", id);
    this.id = id;
  }


  static fromDB(id: string, data: DocumentData): Activity {
    const activity = new Activity();
    activity.id = id;
    activity.title = data["title"];
    activity.icon = data["icon"] || "add"; // Default icon if not provided
    activity.description = data["description"];
    activity.createdAt = data["createdAt"].toDate()   || new Date();
    activity.updatedAt = data["updatedAt"].toDate() || new Date();
    activity.isActive = data["isActive"];
    activity.timeSpend = data["timeSpend"] || 0; // Default to 0 if not provided
    activity.is_active = data["is_active"] || false; // Default to false if not provided
    activity.imageUrl = data["imageUrl"]
    activity.ref = data["ref"] || undefined;
    return activity;
  }

  toDB(): DocumentData {
    return {
      id: this.id,
      title: this.title,
      icon: this.icon,
      description: this.description,
      createdAt: this.createdAt,
      isActive: this.isActive,
      imageUrl: this.imageUrl,
      updatedAt: serverTimestamp(),
    };
  }
}

