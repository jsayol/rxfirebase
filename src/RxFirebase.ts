import * as firebase from 'firebase';

import { RxFirebaseAuth, RxFirebaseUser } from './auth';

import {
  RxFirebaseDatabase,
  RxFirebaseDatabaseRef,
  RxFirebaseDatabaseRefOnDisconnect,
  RxFirebaseDataSnapshot,
} from './database';

import { RxFirebaseStorage } from './storage';

export class RxFirebase {
  private static internalDefault: RxFirebase;

  public readonly app: firebase.app.App;
  public readonly auth: RxFirebaseAuth;
  public readonly database: RxFirebaseDatabase;
  public readonly storage: RxFirebaseStorage;

  constructor(options: Object, name?: string) {
    this.app = firebase.initializeApp(options, name);
    this.auth = new RxFirebaseAuth(this.app);
    this.database = new RxFirebaseDatabase(this);
    this.storage = new RxFirebaseStorage(this.app);
  }

  public static get auth(): RxFirebaseAuth {
    RxFirebase.ensureDefaultInitialized();
    return RxFirebase.internalDefault.auth;
  }

  public static get database(): RxFirebaseDatabase {
    RxFirebase.ensureDefaultInitialized();
    return RxFirebase.internalDefault.database;
  }

  public static get storage(): RxFirebaseStorage {
    RxFirebase.ensureDefaultInitialized();
    return RxFirebase.internalDefault.storage;
  }

  public static get name(): string {
    RxFirebase.ensureDefaultInitialized();
    return RxFirebase.internalDefault.app.name;
  }

  public static get options(): Object {
    RxFirebase.ensureDefaultInitialized();
    return RxFirebase.internalDefault.app.options;
  }

  public static initializeApp(options: Object, name?: string): RxFirebase {
    if ((name === undefined) || (name === '[DEFAULT]')) {
      RxFirebase.internalDefault = new RxFirebase(options);
      return RxFirebase.internalDefault;
    } else {
      return new RxFirebase(options, name);
    }
  }

  private static ensureDefaultInitialized() {
    if (!RxFirebase.internalDefault) {
      throw new Error("RxFirebase hasn't been initialized yet. Call RxFirebase.initializeApp()");
    }
  }

  public get name(): string {
    return this.app.name;
  }

  public get options(): Object {
    return this.app.options;
  }
}

export {
  firebase,
  RxFirebaseAuth,
  RxFirebaseDatabase,
  RxFirebaseDatabaseRef,
  RxFirebaseDatabaseRefOnDisconnect,
  RxFirebaseDataSnapshot,
  RxFirebaseStorage,
  RxFirebaseUser
};
