
# RxFirebase
*Status: Alpha*

RxJS wrapper with extra goodies for the Firebase JavaScript SDK.

[Apache 2.0 License](LICENSE.txt)

## TO-DO
- [ ] **Add tests**
- [x] Auth support
- [x] Database support
- [ ] Storage support
- [ ] Messaging support
- [ ] Fix building of UMD module (CommonJS, AMD)


## Installation

Via npm
```
npm install rxjs firebase rxfirebase --save
```

Via yarn
```
yarn add rxjs firebase rxfirebase
```

## Usage

### ES6 and TypeScript
```ts
import { RxFirebase } from 'rxfirebase';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  messagingSenderId: "...",
  storageBucket: "...",
};

RxFirebase.initializeApp(firebaseConfig);

const items$ = RxFirebase.database.ref('/items').onChildAdded();

items$.subscribe(snapshot => {
  console.log(`Child added with key ${snapshot.key} and value ${snapshot.val()}`);
});

const secretItems$ = RxFirebase.database.ref('/super/secret/items')
  .afterSignIn()
  .untilSignOut()
  .getValue()
  .onChildRemoved();
  
secretItems$.subscribe(item => {
  // Using getValue() emits the value itself instead of the snapshot.
  // It's equivalent to calling snapshot.val()
  console.log(`Child removed with value ${item}`);
});

const userPostsOnSignIn$ = RxFirebase.auth.onSignIn$.switchMap(auth =>
  RxFirebase.database.ref(`/userPosts/${auth.uid}`)
    .asList()
    .untilSignOut()
    .once('value')
);

userPostsOnSignIn$.subscribe(posts => {
  console.log(`This user has ${posts.length} posts.`);
  if (posts.length > 0) {
    // Using asList() emits the data as an Array with the key for each item stored as item.$key
    // If the value is an Object then "item" is the value itself, otherwise
    // it is stored in item.$value (for strings, numbers, and booleans)
    const post = posts[0];
    console.log(`The title for the first post, with key ${post.$key}, is "${post.title}"`);
  }
});

RxFirebase.auth.isSignedIn$.subscribe(isSignedIn => {
  console.log(`The user is ${isSignedIn ? '' : 'NOT '}signed in.`);
});

setTimeout(() => {
  console.log('Signing in...');
  RxFirebase.auth.signInAnonymously();
}, 2000);

setTimeout(() => {
  console.log('Signing out...');
  RxFirebase.auth.signOut();
}, 10000);
```

### UMD (CommonJS, AMD)

Coming soon
