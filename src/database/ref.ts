import * as firebase from 'firebase';
import { Observable, Subscriber } from 'rxjs';
import { RxFirebase } from '../RxFirebase';
import { RxFirebaseDatabase } from './database';

export class RxFirebaseDatabaseRef {
  protected ref: firebase.database.Reference;
  private filters: {[filter: string]: boolean} = {'_getSnapshot': true};
  private callback: (snapshot: RxFirebaseDataSnapshot|null, prevChildKey?: string) => any;

  constructor(public readonly db: RxFirebaseDatabase,
              from: {path?: string, url?: string, ref?: firebase.database.Reference}) {

    if (from.url) {
      this.ref = this.db.sdk.refFromURL(from.url);
    } else if (from.path) {
      this.ref = this.db.sdk.ref(from.path);
    } else if (from.ref) {
      this.ref = from.ref;
    } else {
      throw new Error('RxFirebaseDatabaseRef: no reference specified');
    }
  }

  private static applyFilter(observable: Observable<any>, filter: string): Observable<any> {
    if (filter === 'untilSignIn') {
      return observable.takeUntil(RxFirebase.auth.onSignIn$);
    }

    if (filter === 'untilSignOut') {
      return observable.takeUntil(RxFirebase.auth.onSignOut$);
    }

    if (filter === 'afterSignIn') {
      return RxFirebase.auth.isSignedIn$
        .switchMap((isSignedIn: boolean) => isSignedIn
          ? observable
          : RxFirebase.auth.onSignIn$.take(1).switchMap(() => observable)
        );
    }

    if (filter === 'afterSignOut') {
      return RxFirebase.auth.onSignOut$.take(1).switchMap(() => observable);
    }

    if (filter === '_getSnapshot') {
      return observable.map(({snapshot}: {
        snapshot: RxFirebaseDataSnapshot,
        prevChildKey?: string
      }): RxFirebaseDataSnapshot => snapshot);
    }

    if (filter === 'getValue') {
      return observable.map((snapshot: RxFirebaseDataSnapshot): Object => snapshot.val());
    }

    if (filter === 'asList') {
      return observable.map((value: Object) => {
        const array = [];
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
            let element = value[key];

            if (typeof element !== 'object') {
              element = {$value: element};
            }

            element.$key = key;
            array.push(element);
          }
        }

        return array;
      });
    }

    return observable;
  }

  public child(path: string): RxFirebaseDatabaseRef {
    this.ref = this.ref.child(path);
    return this;
  }

  public get parent(): RxFirebaseDatabaseRef {
    this.ref = this.ref.parent;
    return this;
  }

  public get root(): RxFirebaseDatabaseRef {
    this.ref = this.ref.root;
    return this;
  }

  public get key(): string|null {
    return this.ref.key;
  }

  public untilSignIn(): RxFirebaseDatabaseRef {
    this.filters['untilSignIn'] = true;
    return this;
  }

  public untilSignOut(): RxFirebaseDatabaseRef {
    this.filters['untilSignOut'] = true;
    return this;
  }

  public afterSignIn(): RxFirebaseDatabaseRef {
    this.filters['afterSignIn'] = true;
    return this;
  }

  public afterSignOut(): RxFirebaseDatabaseRef {
    this.filters['afterSignOut'] = true;
    return this;
  }

  public getValue(): RxFirebaseDatabaseRef {
    this.filters['getValue'] = true;
    return this;
  }

  public withPrevChildKey() {
    this.filters['_getSnapshot'] = false;
    this.filters['withPrevChildKey'] = true;
    return this;
  }

  public asList(): RxFirebaseDatabaseRef {
    this.filters['getValue'] = true;
    this.filters['asList'] = true;
    return this;
  }

  public onValue(): Observable<any> {
    return this.on('value');
  }

  public onChildAdded(): Observable<any> {
    return this.on('child_added');
  }

  public onChildRemoved(): Observable<any> {
    return this.on('child_removed');
  }

  public onChildChanged(): Observable<any> {
    return this.on('child_changed');
  }

  public onChildMoved(): Observable<any> {
    return this.on('child_moved');
  }

  public onceValue(): Observable<any> {
    return this.once('value');
  }

  public onceChildAdded(): Observable<any> {
    return this.once('child_added');
  }

  public onceChildRemoved(): Observable<any> {
    return this.once('child_removed');
  }

  public onceChildChanged(): Observable<any> {
    return this.once('child_changed');
  }

  public onceChildMoved(): Observable<any> {
    return this.once('child_moved');
  }

  public startAt(value: number|string|boolean|null, key?: string): RxFirebaseDatabaseRef {
    this.ref = <firebase.database.Reference> this.ref.startAt(value, key);
    return this;
  }

  public endAt(value: number|string|boolean|null, key?: string): RxFirebaseDatabaseRef {
    this.ref = <firebase.database.Reference> this.ref.endAt(value, key);
    return this;
  }

  public equalTo(value: number|string|boolean|null, key?: string): RxFirebaseDatabaseRef {
    this.ref = <firebase.database.Reference> this.ref.equalTo(value, key);
    return this;
  }

  public isEqual(other: RxFirebaseDatabaseRef|null): boolean {
    return this.ref.isEqual(other && other.ref);
  }

  public limitToFirst(limit: number): RxFirebaseDatabaseRef {
    this.ref = <firebase.database.Reference> this.ref.limitToFirst(limit);
    return this;
  }

  public limitToLast(limit: number): RxFirebaseDatabaseRef {
    this.ref = <firebase.database.Reference> this.ref.limitToLast(limit);
    return this;
  }

  public orderByChild(path: string): RxFirebaseDatabaseRef {
    this.ref = <firebase.database.Reference> this.ref.orderByChild(path);
    return this;
  }

  public orderByKey(): RxFirebaseDatabaseRef {
    this.ref = <firebase.database.Reference> this.ref.orderByKey();
    return this;
  }

  public orderByPriority(): RxFirebaseDatabaseRef {
    this.ref = <firebase.database.Reference> this.ref.orderByPriority();
    return this;
  }

  public orderByValue(): RxFirebaseDatabaseRef {
    this.ref = <firebase.database.Reference> this.ref.orderByValue();
    return this;
  }

  public toString(): string {
    return this.ref.toString();
  }

  public on(eventType: string): Observable<any> {
    let observable = new Observable<any>((subscriber: Subscriber<any>): Function => {
      this.callback = (snapshot: RxFirebaseDataSnapshot, prevChildKey?: string): any => {
        subscriber.next({snapshot, prevChildKey});
      };

      this.ref.on(
        eventType,
        this.callback,
        (err: Error) => subscriber.error(err)
      );

      return () => this.ref.off(eventType, this.callback);
    });

    return this.applyFilters(observable);
  }

  public once(eventType: string): Observable<any> {
    let observable = new Observable<any>((subscriber: Subscriber<any>): Function => {
      this.callback = (snapshot: RxFirebaseDataSnapshot, prevChildKey?: string) => {
        subscriber.next({snapshot, prevChildKey});
        subscriber.complete();
      };

      this.ref.once(
        eventType,
        this.callback,
        (err: Error) => subscriber.error(err)
      );

      return () => this.ref.off(eventType, this.callback);
    });

    return this.applyFilters(observable);
  }

  public onDisconnect(): RxFirebaseDatabaseRefOnDisconnect {
    return this.ref.onDisconnect();
  }

  public push(value?: any, onComplete?: (err: Error|null) => any): RxFirebaseDatabaseRef {
    return new RxFirebaseDatabaseRef(this.db, {ref: this.ref.push(value, onComplete)});
  }

  public remove(onComplete?: (err: Error|null) => any): Promise<any> {
    return <Promise<any>> this.ref.remove(onComplete);
  }

  public set(value: any, onComplete?: (err: Error|null) => any): Promise<any> {
    return <Promise<any>> this.ref.set(value, onComplete);
  }

  public setPriority(priority: string|number|null, onComplete: (err: Error|null) => any): Promise<any> {
    return <Promise<any>> this.ref.setPriority(priority, onComplete);
  }

  public setWithPriority(newVal: any,
                         newPriority: string|number|null,
                         onComplete?: (err: Error|null) => any): Promise<any> {
    return <Promise<any>> this.ref.setWithPriority(newVal, newPriority, onComplete);
  }

  public transaction(transactionUpdate: (a: any) => any,
                     onComplete?: (err: Error|null,
                                   committed: boolean,
                                   snapshot: RxFirebaseDataSnapshot|null) => any,
                     applyLocally?: boolean): Promise<any> {
    return <Promise<any>> this.ref.transaction(transactionUpdate, onComplete, applyLocally);
  }

  public update(values: Object, onComplete?: (err: Error|null) => any): Promise<any> {
    return <Promise<any>> this.ref.update(values, onComplete);
  }

  private applyFilters(observable: Observable<any>): Observable<any> {
    if (this.filters['withPrevChildKey'] && this.filters['getValue']) {
      throw new Error('RxFirebaseDatabaseRef: withPrevChildKey() cannot be used in conjunction with getValue() or asList()');
    }

    for (let filter in this.filters) {
      observable = RxFirebaseDatabaseRef.applyFilter(observable, filter);
    }

    return observable;
  }

}

export interface RxFirebaseDataSnapshot extends firebase.database.DataSnapshot {
}

export interface RxFirebaseDatabaseRefOnDisconnect extends firebase.database.OnDisconnect {
}
