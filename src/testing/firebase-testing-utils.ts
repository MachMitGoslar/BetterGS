/**
 * Firebase Testing Utilities
 *
 * Comprehensive mocks and stubs for Firebase services used in testing.
 * Provides realistic behavior for Firestore, Authentication, and Storage
 * without requiring actual Firebase connections.
 *
 * @description Testing infrastructure for Firebase-dependent components
 * @since 1.0.0
 * @author BetterGS Team
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

// ==========================================
// Firestore Mock Types and Interfaces
// ==========================================

/**
 * Mock DocumentReference interface
 * Simulates Firestore document reference behavior
 */
export interface MockDocumentReference {
  id: string;
  path: string;
  get(): Promise<MockDocumentSnapshot>;
  set(data: any, options?: any): Promise<void>;
  update(data: any): Promise<void>;
  delete(): Promise<void>;
  onSnapshot(callback: (snapshot: MockDocumentSnapshot) => void): () => void;
}

/**
 * Mock DocumentSnapshot interface
 * Simulates Firestore document snapshot behavior
 */
export interface MockDocumentSnapshot {
  id: string;
  exists: boolean;
  data(): any;
  get(field: string): any;
  ref: MockDocumentReference;
}

/**
 * Mock CollectionReference interface
 * Simulates Firestore collection reference behavior
 */
export interface MockCollectionReference {
  id: string;
  path: string;
  doc(id?: string): MockDocumentReference;
  add(data: any): Promise<MockDocumentReference>;
  get(): Promise<MockQuerySnapshot>;
  where(field: string, operator: any, value: any): MockQuery;
  orderBy(field: string, direction?: 'asc' | 'desc'): MockQuery;
  limit(limit: number): MockQuery;
  onSnapshot(callback: (snapshot: MockQuerySnapshot) => void): () => void;
}

/**
 * Mock Query interface
 * Simulates Firestore query behavior
 */
export interface MockQuery {
  get(): Promise<MockQuerySnapshot>;
  where(field: string, operator: any, value: any): MockQuery;
  orderBy(field: string, direction?: 'asc' | 'desc'): MockQuery;
  limit(limit: number): MockQuery;
  onSnapshot(callback: (snapshot: MockQuerySnapshot) => void): () => void;
}

/**
 * Mock QuerySnapshot interface
 * Simulates Firestore query snapshot behavior
 */
export interface MockQuerySnapshot {
  docs: MockDocumentSnapshot[];
  size: number;
  empty: boolean;
  forEach(callback: (doc: MockDocumentSnapshot) => void): void;
}

/**
 * Mock WriteBatch interface
 * Simulates Firestore batch operations
 */
export interface MockWriteBatch {
  set(ref: MockDocumentReference, data: any, options?: any): MockWriteBatch;
  update(ref: MockDocumentReference, data: any): MockWriteBatch;
  delete(ref: MockDocumentReference): MockWriteBatch;
  commit(): Promise<void>;
}

// ==========================================
// Firestore Mock Implementation
// ==========================================

/**
 * Mock Firestore Database
 *
 * Provides a complete in-memory simulation of Firestore database
 * operations for testing purposes. Maintains data consistency
 * and provides realistic async behavior.
 */
@Injectable()
export class MockFirestore {
  private collections = new Map<string, Map<string, any>>();
  private listeners = new Map<string, BehaviorSubject<any>>();

  /**
   * Get or create a collection reference
   *
   * @param path - Collection path
   * @returns Mock collection reference
   */
  collection(path: string): MockCollectionReference {
    if (!this.collections.has(path)) {
      this.collections.set(path, new Map());
    }

    return {
      id: path.split('/').pop() || path,
      path,

      doc: (id?: string) => {
        const docId = id || this.generateId();
        return this.doc(`${path}/${docId}`);
      },

      add: async (data: any) => {
        const docId = this.generateId();
        const docRef = this.doc(`${path}/${docId}`);
        await docRef.set(data);
        return docRef;
      },

      get: async () => {
        const collection = this.collections.get(path) || new Map();
        const docs = Array.from(collection.entries()).map(([id, data]) =>
          this.createDocumentSnapshot(id, data, `${path}/${id}`)
        );

        return {
          docs,
          size: docs.length,
          empty: docs.length === 0,
          forEach: (callback: (doc: MockDocumentSnapshot) => void) => {
            docs.forEach(callback);
          },
        };
      },

      where: (field: string, operator: any, value: any) => {
        return this.createQuery(path, [{ field, operator, value }]);
      },

      orderBy: (field: string, direction?: 'asc' | 'desc') => {
        return this.createQuery(
          path,
          [],
          [{ field, direction: direction || 'asc' }]
        );
      },

      limit: (limit: number) => {
        return this.createQuery(path, [], [], limit);
      },

      onSnapshot: (callback: (snapshot: MockQuerySnapshot) => void) => {
        const subject = this.getOrCreateListener(`collection:${path}`);
        const subscription = subject.subscribe(() => {
          this.collection(path).get().then(callback);
        });

        // Initial call
        this.collection(path).get().then(callback);

        return () => subscription.unsubscribe();
      },
    };
  }

  /**
   * Get a document reference
   *
   * @param path - Document path
   * @returns Mock document reference
   */
  doc(path: string): MockDocumentReference {
    const [collectionPath, docId] = this.splitPath(path);

    return {
      id: docId,
      path,

      get: async () => {
        const collection = this.collections.get(collectionPath);
        const data = collection?.get(docId);
        return this.createDocumentSnapshot(docId, data, path);
      },

      set: async (data: any, options?: any) => {
        const collection = this.getOrCreateCollection(collectionPath);

        if (options?.merge) {
          const existing = collection.get(docId) || {};
          collection.set(docId, { ...existing, ...data });
        } else {
          collection.set(docId, { ...data });
        }

        this.notifyListeners(collectionPath);
        this.notifyListeners(`doc:${path}`);
      },

      update: async (data: any) => {
        const collection = this.getOrCreateCollection(collectionPath);
        const existing = collection.get(docId) || {};
        collection.set(docId, { ...existing, ...data });

        this.notifyListeners(collectionPath);
        this.notifyListeners(`doc:${path}`);
      },

      delete: async () => {
        const collection = this.collections.get(collectionPath);
        if (collection) {
          collection.delete(docId);
          this.notifyListeners(collectionPath);
          this.notifyListeners(`doc:${path}`);
        }
      },

      onSnapshot: (callback: (snapshot: MockDocumentSnapshot) => void) => {
        const subject = this.getOrCreateListener(`doc:${path}`);
        const subscription = subject.subscribe(() => {
          this.doc(path).get().then(callback);
        });

        // Initial call
        this.doc(path).get().then(callback);

        return () => subscription.unsubscribe();
      },
    };
  }

  /**
   * Create a write batch
   *
   * @returns Mock write batch
   */
  batch(): MockWriteBatch {
    const operations: Array<() => Promise<void>> = [];

    return {
      set: (ref: MockDocumentReference, data: any, options?: any) => {
        operations.push(() => ref.set(data, options));
        return this as any;
      },

      update: (ref: MockDocumentReference, data: any) => {
        operations.push(() => ref.update(data));
        return this as any;
      },

      delete: (ref: MockDocumentReference) => {
        operations.push(() => ref.delete());
        return this as any;
      },

      commit: async () => {
        for (const operation of operations) {
          await operation();
        }
      },
    };
  }

  /**
   * Clear all data (useful for test cleanup)
   */
  clearData(): void {
    this.collections.clear();
    this.listeners.clear();
  }

  /**
   * Set data directly for testing
   *
   * @param path - Document path
   * @param data - Data to set
   */
  setTestData(path: string, data: any): void {
    const [collectionPath, docId] = this.splitPath(path);
    const collection = this.getOrCreateCollection(collectionPath);
    collection.set(docId, data);
  }

  /**
   * Get data directly for testing
   *
   * @param path - Document path
   * @returns Document data
   */
  getTestData(path: string): any {
    const [collectionPath, docId] = this.splitPath(path);
    const collection = this.collections.get(collectionPath);
    return collection?.get(docId);
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private splitPath(path: string): [string, string] {
    const parts = path.split('/');
    const docId = parts.pop() || '';
    const collectionPath = parts.join('/');
    return [collectionPath, docId];
  }

  private getOrCreateCollection(path: string): Map<string, any> {
    if (!this.collections.has(path)) {
      this.collections.set(path, new Map());
    }
    return this.collections.get(path)!;
  }

  private getOrCreateListener(key: string): BehaviorSubject<any> {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new BehaviorSubject(null));
    }
    return this.listeners.get(key)!;
  }

  private notifyListeners(key: string): void {
    const listener = this.listeners.get(key);
    if (listener) {
      listener.next(Date.now());
    }
  }

  private createDocumentSnapshot(
    id: string,
    data: any,
    path: string
  ): MockDocumentSnapshot {
    return {
      id,
      exists: data !== undefined,
      data: () => data,
      get: (field: string) => data?.[field],
      ref: this.doc(path),
    };
  }

  /**
   * Execute query and return filtered documents
   */
  private executeQuery(
    path: string,
    whereConditions: Array<{ field: string; operator: string; value: any }>,
    orderConditions: Array<{ field: string; direction: 'asc' | 'desc' }>,
    limitValue?: number
  ): MockDocumentSnapshot[] {
    // Get all documents for the collection
    let docs: MockDocumentSnapshot[] = [];

    const collection = this.collections.get(path);
    if (collection) {
      collection.forEach((docData, docId) => {
        docs.push(
          this.createDocumentSnapshot(docId, docData, `${path}/${docId}`)
        );
      });
    }

    // Apply where conditions
    whereConditions.forEach(({ field, operator, value }) => {
      docs = docs.filter((doc) => {
        const fieldValue = doc.get(field);
        switch (operator) {
          case '==':
            return fieldValue === value;
          case '!=':
            return fieldValue !== value;
          case '<':
            return fieldValue < value;
          case '<=':
            return fieldValue <= value;
          case '>':
            return fieldValue > value;
          case '>=':
            return fieldValue >= value;
          case 'array-contains':
            return Array.isArray(fieldValue) && fieldValue.includes(value);
          case 'in':
            return Array.isArray(value) && value.includes(fieldValue);
          default:
            return true;
        }
      });
    });

    // Apply order conditions
    orderConditions.forEach(({ field, direction }) => {
      docs.sort((a, b) => {
        const aValue = a.get(field);
        const bValue = b.get(field);
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return direction === 'desc' ? -comparison : comparison;
      });
    });

    // Apply limit
    if (limitValue) {
      docs = docs.slice(0, limitValue);
    }

    return docs;
  }

  private createQuery(
    path: string,
    whereConditions: any[] = [],
    orderConditions: any[] = [],
    limitValue?: number
  ): MockQuery {
    return {
      get: async () => {
        let collection = this.collections.get(path) || new Map();
        let docs = Array.from(collection.entries()).map(([id, data]) =>
          this.createDocumentSnapshot(id, data, `${path}/${id}`)
        );

        // Apply where conditions
        whereConditions.forEach(({ field, operator, value }) => {
          docs = docs.filter((doc) => {
            const fieldValue = doc.get(field);
            switch (operator) {
              case '==':
                return fieldValue === value;
              case '!=':
                return fieldValue !== value;
              case '>':
                return fieldValue > value;
              case '>=':
                return fieldValue >= value;
              case '<':
                return fieldValue < value;
              case '<=':
                return fieldValue <= value;
              case 'array-contains':
                return Array.isArray(fieldValue) && fieldValue.includes(value);
              case 'in':
                return Array.isArray(value) && value.includes(fieldValue);
              default:
                return true;
            }
          });
        });

        // Apply order conditions
        orderConditions.forEach(({ field, direction }) => {
          docs.sort((a, b) => {
            const aValue = a.get(field);
            const bValue = b.get(field);
            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return direction === 'desc' ? -comparison : comparison;
          });
        });

        // Apply limit
        if (limitValue) {
          docs = docs.slice(0, limitValue);
        }

        return {
          docs,
          size: docs.length,
          empty: docs.length === 0,
          forEach: (callback: (doc: MockDocumentSnapshot) => void) => {
            docs.forEach(callback);
          },
        };
      },

      where: (field: string, operator: any, value: any) => {
        return this.createQuery(
          path,
          [...whereConditions, { field, operator, value }],
          orderConditions,
          limitValue
        );
      },

      orderBy: (field: string, direction?: 'asc' | 'desc') => {
        return this.createQuery(
          path,
          whereConditions,
          [...orderConditions, { field, direction: direction || 'asc' }],
          limitValue
        );
      },

      limit: (limit: number) => {
        return this.createQuery(path, whereConditions, orderConditions, limit);
      },

      onSnapshot: (callback: (snapshot: MockQuerySnapshot) => void) => {
        const subject = this.getOrCreateListener(`query:${path}`);
        const subscription = subject.subscribe(() => {
          // Re-evaluate query with current data
          const filteredDocs = this.executeQuery(
            path,
            whereConditions,
            orderConditions,
            limitValue
          );
          const querySnapshot = {
            empty: filteredDocs.length === 0,
            size: filteredDocs.length,
            docs: filteredDocs,
            forEach: (callback: (doc: MockDocumentSnapshot) => void) => {
              filteredDocs.forEach(callback);
            },
          } as MockQuerySnapshot;
          callback(querySnapshot);
        });

        // Initial call
        const initialDocs = this.executeQuery(
          path,
          whereConditions,
          orderConditions,
          limitValue
        );
        const initialSnapshot = {
          empty: initialDocs.length === 0,
          size: initialDocs.length,
          docs: initialDocs,
          forEach: (callback: (doc: MockDocumentSnapshot) => void) => {
            initialDocs.forEach(callback);
          },
        } as MockQuerySnapshot;
        callback(initialSnapshot);

        return () => subscription.unsubscribe();
      },
    } as MockQuery;
  }
}

// ==========================================
// Firebase Functions Mocks
// ==========================================

/**
 * Mock Firestore functions
 * Provides drop-in replacements for Firebase/Firestore functions
 */
export const mockFirestoreFunctions = {
  /**
   * Mock collection function
   */
  collection: (firestore: MockFirestore, path: string) => {
    return firestore.collection(path);
  },

  /**
   * Mock doc function
   */
  doc: (firestore: MockFirestore, path: string, ...segments: string[]) => {
    const fullPath = [path, ...segments].join('/');
    return firestore.doc(fullPath);
  },

  /**
   * Mock getDoc function
   */
  getDoc: async (ref: MockDocumentReference) => {
    return ref.get();
  },

  /**
   * Mock getDocs function
   */
  getDocs: async (query: MockCollectionReference | MockQuery) => {
    return query.get();
  },

  /**
   * Mock setDoc function
   */
  setDoc: async (ref: MockDocumentReference, data: any, options?: any) => {
    return ref.set(data, options);
  },

  /**
   * Mock updateDoc function
   */
  updateDoc: async (ref: MockDocumentReference, data: any) => {
    return ref.update(data);
  },

  /**
   * Mock deleteDoc function
   */
  deleteDoc: async (ref: MockDocumentReference) => {
    return ref.delete();
  },

  /**
   * Mock addDoc function
   */
  addDoc: async (collectionRef: MockCollectionReference, data: any) => {
    return collectionRef.add(data);
  },

  /**
   * Mock writeBatch function
   */
  writeBatch: (firestore: MockFirestore) => {
    return firestore.batch();
  },

  /**
   * Mock query functions
   */
  query: (collectionRef: MockCollectionReference, ...constraints: any[]) => {
    let result: MockQuery = collectionRef as any;

    constraints.forEach((constraint) => {
      if (constraint.type === 'where') {
        result = result.where(
          constraint.field,
          constraint.operator,
          constraint.value
        );
      } else if (constraint.type === 'orderBy') {
        result = result.orderBy(constraint.field, constraint.direction);
      } else if (constraint.type === 'limit') {
        result = result.limit(constraint.value);
      }
    });

    return result;
  },

  /**
   * Mock where constraint
   */
  where: (field: string, operator: any, value: any) => ({
    type: 'where',
    field,
    operator,
    value,
  }),

  /**
   * Mock orderBy constraint
   */
  orderBy: (field: string, direction?: 'asc' | 'desc') => ({
    type: 'orderBy',
    field,
    direction: direction || 'asc',
  }),

  /**
   * Mock limit constraint
   */
  limit: (value: number) => ({
    type: 'limit',
    value,
  }),

  /**
   * Mock serverTimestamp
   */
  serverTimestamp: () => new Date(),

  /**
   * Mock arrayUnion
   */
  arrayUnion: (...elements: any[]) => ({
    _methodName: 'arrayUnion',
    _elements: elements,
  }),

  /**
   * Mock arrayRemove
   */
  arrayRemove: (...elements: any[]) => ({
    _methodName: 'arrayRemove',
    _elements: elements,
  }),

  /**
   * Mock increment
   */
  increment: (value: number) => ({
    _methodName: 'increment',
    _operand: value,
  }),

  /**
   * Mock onSnapshot function
   */
  onSnapshot: (
    query: MockCollectionReference | MockQuery | MockDocumentReference,
    callback: (snapshot: any) => void
  ) => {
    return query.onSnapshot(callback);
  },

  /**
   * Mock collectionSnapshots function (for RxJS)
   */
  collectionSnapshots: (
    collectionRef: MockCollectionReference
  ): Observable<MockQuerySnapshot> => {
    return new Observable((subscriber) => {
      const unsubscribe = collectionRef.onSnapshot((snapshot) => {
        subscriber.next(snapshot);
      });

      return unsubscribe;
    });
  },

  /**
   * Mock docSnapshots function (for RxJS)
   */
  docSnapshots: (
    docRef: MockDocumentReference
  ): Observable<MockDocumentSnapshot> => {
    return new Observable((subscriber) => {
      const unsubscribe = docRef.onSnapshot((snapshot) => {
        subscriber.next(snapshot);
      });

      return unsubscribe;
    });
  },
};

// ==========================================
// Firebase Auth Mocks
// ==========================================

/**
 * Mock Firebase Auth User
 */
export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  photoURL: string | null;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

/**
 * Mock Firebase Auth Service
 */
@Injectable()
export class MockAuth {
  private userSubject = new BehaviorSubject<MockUser | null>(null);
  public currentUser: MockUser | null = null;

  /**
   * Observable of auth state changes
   */
  get authState$(): Observable<MockUser | null> {
    return this.userSubject.asObservable();
  }

  /**
   * Mock sign in with email and password
   */
  async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<{ user: MockUser }> {
    const user: MockUser = {
      uid: `mock-uid-${Date.now()}`,
      email,
      displayName: null,
      emailVerified: true,
      isAnonymous: false,
      photoURL: null,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
    };

    this.setCurrentUser(user);
    return { user };
  }

  /**
   * Mock create user with email and password
   */
  async createUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<{ user: MockUser }> {
    const user: MockUser = {
      uid: `mock-uid-${Date.now()}`,
      email,
      displayName: null,
      emailVerified: false,
      isAnonymous: false,
      photoURL: null,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
    };

    this.setCurrentUser(user);
    return { user };
  }

  /**
   * Mock sign in anonymously
   */
  async signInAnonymously(): Promise<{ user: MockUser }> {
    const user: MockUser = {
      uid: `mock-anon-uid-${Date.now()}`,
      email: null,
      displayName: null,
      emailVerified: false,
      isAnonymous: true,
      photoURL: null,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
    };

    this.setCurrentUser(user);
    return { user };
  }

  /**
   * Mock sign out
   */
  async signOut(): Promise<void> {
    this.setCurrentUser(null);
  }

  /**
   * Mock update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    // Mock implementation - password would be updated
  }

  /**
   * Mock delete user
   */
  async deleteUser(): Promise<void> {
    this.setCurrentUser(null);
  }

  /**
   * Set current user for testing
   */
  setCurrentUser(user: MockUser | null): void {
    this.currentUser = user;
    this.userSubject.next(user);
  }

  /**
   * Clear auth state
   */
  clearAuth(): void {
    this.setCurrentUser(null);
  }
}

// ==========================================
// Firebase Storage Mocks
// ==========================================

/**
 * Mock Firebase Storage Reference
 */
export interface MockStorageReference {
  bucket: string;
  fullPath: string;
  name: string;
  putString(
    data: string,
    format?: string,
    metadata?: any
  ): Promise<MockUploadResult>;
  getDownloadURL(): Promise<string>;
  delete(): Promise<void>;
  child(path: string): MockStorageReference;
}

/**
 * Mock Upload Result
 */
export interface MockUploadResult {
  ref: MockStorageReference;
  metadata: {
    bucket: string;
    fullPath: string;
    name: string;
    size: number;
    timeCreated: string;
    contentType?: string;
  };
}

/**
 * Mock Firebase Storage Service
 */
@Injectable()
export class MockStorage {
  private files = new Map<string, { data: string; metadata: any }>();

  /**
   * Get storage reference
   */
  ref(path?: string): MockStorageReference {
    const fullPath = path || '';

    return {
      bucket: 'mock-bucket',
      fullPath,
      name: fullPath.split('/').pop() || '',

      putString: async (data: string, format?: string, metadata?: any) => {
        this.files.set(fullPath, { data, metadata: metadata || {} });

        return {
          ref: this.ref(fullPath),
          metadata: {
            bucket: 'mock-bucket',
            fullPath,
            name: fullPath.split('/').pop() || '',
            size: data.length,
            timeCreated: new Date().toISOString(),
            contentType: metadata?.contentType || 'application/octet-stream',
          },
        };
      },

      getDownloadURL: async () => {
        return `https://mock-storage.com/${fullPath}`;
      },

      delete: async () => {
        this.files.delete(fullPath);
      },

      child: (childPath: string) => {
        return this.ref(`${fullPath}/${childPath}`);
      },
    };
  }

  /**
   * Clear all files (for testing)
   */
  clearFiles(): void {
    this.files.clear();
  }

  /**
   * Get file data (for testing)
   */
  getFileData(path: string): { data: string; metadata: any } | undefined {
    return this.files.get(path);
  }
}

// ==========================================
// Testing Provider Configuration
// ==========================================

/**
 * Firebase Testing Providers
 *
 * Complete provider configuration for testing Firebase-dependent components.
 * Use this in your TestBed.configureTestingModule() calls.
 */
export const FIREBASE_TESTING_PROVIDERS = [
  MockFirestore,
  MockAuth,
  MockStorage,
  { provide: 'Firestore', useClass: MockFirestore },
  { provide: 'Auth', useClass: MockAuth },
  { provide: 'Storage', useClass: MockStorage },
];

/**
 * Helper function to create Firebase testing module
 *
 * @param mockData - Initial data to populate in Firestore
 * @returns Testing module configuration
 */
export function createFirebaseTestingModule(mockData?: {
  [path: string]: any;
}) {
  const mockFirestore = new MockFirestore();
  const mockAuth = new MockAuth();
  const mockStorage = new MockStorage();

  // Populate initial data if provided
  if (mockData) {
    Object.entries(mockData).forEach(([path, data]) => {
      mockFirestore.setTestData(path, data);
    });
  }

  return {
    providers: [
      { provide: MockFirestore, useValue: mockFirestore },
      { provide: MockAuth, useValue: mockAuth },
      { provide: MockStorage, useValue: mockStorage },
      { provide: 'Firestore', useValue: mockFirestore },
      { provide: 'Auth', useValue: mockAuth },
      { provide: 'Storage', useValue: mockStorage },
    ],
    mockFirestore,
    mockAuth,
    mockStorage,
  };
}
