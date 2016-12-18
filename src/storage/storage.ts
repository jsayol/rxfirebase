import * as firebase from 'firebase';

export class RxFirebaseStorage {
  public get sdk(): firebase.storage.Storage {
    if (!this._sdk) {
      throw new Error('Firebase Storage is not yet available in NodeJS, only in the browser');
    }

    return this._sdk;
  }

  private readonly _sdk: firebase.storage.Storage;

  constructor(app: firebase.app.App) {
    // Firebase Storage is not yet available in NodeJS, only in the browser
    if (firebase.storage) {
      this._sdk = firebase.storage && firebase.storage(app);
    }

  }
}
