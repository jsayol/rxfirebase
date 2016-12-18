import * as firebase from 'firebase';

import { Observable, Scheduler, Subscriber } from 'rxjs';

export interface RxFirebaseUser extends firebase.User {
}

export class RxFirebaseAuth {
  public readonly onAuthStateChanged$: Observable<RxFirebaseUser>;
  public readonly onSignIn$: Observable<RxFirebaseUser>;
  public readonly onSignOut$: Observable<RxFirebaseUser>;
  public readonly isSignedIn$: Observable<boolean>;

  private readonly sdk: firebase.auth.Auth;
  private readonly initiallySingedOut$: Observable<any>;
  private onAuthStateChanged$complete: () => any;
  private currentAuth: RxFirebaseUser;

  constructor(public readonly app: firebase.app.App) {
    this.sdk = firebase.auth(this.app);

    this.onAuthStateChanged$ = new Observable<RxFirebaseUser>((subscriber: Subscriber<RxFirebaseUser>) => {
      this.onAuthStateChanged$complete = this.sdk.onAuthStateChanged((auth: RxFirebaseUser) => subscriber.next(auth));
    })
      .share()
      .observeOn(Scheduler.asap);

    this.onSignIn$ = this.onAuthStateChanged$
      .filter((auth: RxFirebaseUser) => !!auth)
      .do((auth: RxFirebaseUser) => this.currentAuth = auth)
      .share()
      .observeOn(Scheduler.asap);

    const [signOut$, initiallySingedOut$]: Array<Observable<RxFirebaseUser>> = this.onAuthStateChanged$
      .partition((auth: RxFirebaseUser) => !auth && !!this.currentAuth);

    this.onSignOut$ = signOut$
      .map((auth: RxFirebaseUser) => {
        const currentAuth = this.currentAuth;
        this.currentAuth = auth;
        return currentAuth;
      })
      .share()
      .observeOn(Scheduler.asap);

    this.initiallySingedOut$ = initiallySingedOut$
      .do((auth: RxFirebaseUser) => this.currentAuth = auth);

    this.isSignedIn$ = this.initiallySingedOut$
      .merge(this.onSignIn$)
      .merge(this.onSignOut$)
      .map(() => !!this.currentAuth)
      .publishBehavior<boolean>(void 0)
      .refCount()
      .filter((isSignedIn: boolean) => isSignedIn !== undefined)
      .distinctUntilChanged();
  }

  public get currentUser(): RxFirebaseUser {
    return this.currentAuth;
  }

  public createCustomToken(uid: string, developerClaims?: Object|null): string {
    return this.sdk.createCustomToken(uid, developerClaims);
  }

  public applyActionCode(code: string): Promise<any> {
    return <Promise<any>> this.sdk.applyActionCode(code);
  }

  public checkActionCode(code: string): Promise<any> {
    return <Promise<any>> this.sdk.checkActionCode(code);
  }

  public confirmPasswordReset(code: string, newPassword: string): Promise<any> {
    return <Promise<any>> this.sdk.confirmPasswordReset(code, newPassword);
  }

  public createUserWithEmailAndPassword(email: string, password: string): Promise<any> {
    return <Promise<any>> this.sdk.createUserWithEmailAndPassword(email, password);
  }

  public fetchProvidersForEmail(email: string): Promise<any> {
    return <Promise<any>> this.sdk.fetchProvidersForEmail(email);
  }

  public getRedirectResult(): Promise<any> {
    return <Promise<any>> this.sdk.getRedirectResult();
  }

  public sendPasswordResetEmail(email: string): Promise<any> {
    return <Promise<any>> this.sdk.sendPasswordResetEmail(email);
  }

  public signInAnonymously(): Promise<any> {
    return <Promise<any>> this.sdk.signInAnonymously();
  }

  public signInWithCredential(credential: firebase.auth.AuthCredential): Promise<any> {
    return <Promise<any>> this.sdk.signInWithCredential(credential);
  }

  public signInWithCustomToken(token: string): Promise<any> {
    return <Promise<any>> this.sdk.signInWithCustomToken(token);
  }

  public signInWithEmailAndPassword(email: string, password: string): Promise<any> {
    return <Promise<any>> this.sdk.signInWithEmailAndPassword(email, password);
  }

  public signInWithPopup(provider: firebase.auth.AuthProvider): Promise<any> {
    return <Promise<any>> this.sdk.signInWithPopup(provider);
  }

  public signInWithRedirect(provider: firebase.auth.AuthProvider): Promise<any> {
    return <Promise<any>> this.sdk.signInWithRedirect(provider);
  }

  public signOut(): Promise<any> {
    return <Promise<any>> this.sdk.signOut();
  }

  public verifyIdToken(idToken: string): Promise<any> {
    return <Promise<any>> this.sdk.verifyIdToken(idToken);
  }

  public verifyPasswordResetCode(code: string): Promise<any> {
    return <Promise<any>> this.sdk.verifyPasswordResetCode(code);
  }

}
