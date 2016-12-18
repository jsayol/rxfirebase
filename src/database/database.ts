import * as firebase from 'firebase';
import { RxFirebase } from '../RxFirebase';
import { RxFirebaseDatabaseRef } from './ref';

export class RxFirebaseDatabase {
  public static ServerValue = firebase.database.ServerValue;

  public readonly sdk: firebase.database.Database;

  constructor(public readonly rxfb: RxFirebase) {
    this.sdk = firebase.database(this.rxfb.app);
  }

  public static enableLogging(enabled?: boolean, persistent?: boolean): void {
    firebase.database.enableLogging(enabled, persistent);
  }

  public ref(path?: string): RxFirebaseDatabaseRef {
    return new RxFirebaseDatabaseRef(this, {path});
  }

  public refFromURL(url: string): RxFirebaseDatabaseRef {
    return new RxFirebaseDatabaseRef(this, {url});
  }

  public goOffline(): void {
    this.sdk.goOffline();
  }

  public goOnline(): void {
    this.sdk.goOnline();
  }
}
