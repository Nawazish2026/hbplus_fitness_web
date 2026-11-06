# HBPlus Auth

Cross-platform sign-in for HBPlus. The app runs on Web, Android, and iOS with Expo, React Native Web, Firebase Authentication, and Cloud Firestore. Only verified **@hbplus.fit** accounts can sign in.

The domain check is centralized in `src/auth/domainPolicy.ts`. Firestore security rules enforce the same restriction on every read and write. A signed-in browser session is not enough to read protected data.

## Stack

- Expo SDK 58, Expo Router, TypeScript
- React Native and React Native Web
- Firebase Authentication (Google) and Cloud Firestore
- AsyncStorage session persistence on Android and iOS
- Browser local persistence on Web
- Netlify for the static web export

## Project layout

```text
src/app/            Expo Router screens and protected layouts
src/auth/           Google sign-in, domain gate, auth state
src/config/         Environment variables and Firebase initialization
src/firestore/      Profile documents
src/components/     Shared UI
src/navigation/     Route guard
firestore.rules     Server-side access control
scripts/set-role.ts Server-only admin claim tool
```

## Install

Use Node.js 24.12 or newer and npm.

```bash
npm install
cp .env.example .env
```

Fill `.env` from the Firebase console. Do not commit `.env`, `service-account.json`, `google-services.json`, or `GoogleService-Info.plist`.

## Firebase and Google setup

1. Create a Firebase project and register a Web app. Copy the client config into the `EXPO_PUBLIC_FIREBASE_*` variables.
2. Enable **Authentication → Google**.
3. Add every host you use under **Authentication → Settings → Authorized domains**, including `localhost` and the Netlify domain.
4. Create a Cloud Firestore database.
5. In Google Cloud → Credentials, copy the **Web client ID** into `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Android and iOS must send that ID so Firebase can verify the ID token. Do not put a client secret in the app.
6. Create an iOS OAuth client for bundle ID `fit.hbplus.auth` and an Android OAuth client for package `fit.hbplus.auth`. Add the debug and Play App Signing SHA-1 fingerprints to the Android client and to the Firebase Android app.
7. Download `GoogleService-Info.plist` and `google-services.json`. Place them in the project root. They are gitignored. When both files are present, `app.config.js` enables the Google Sign-In config plugin and points Expo at them.
8. Deploy the rules:

```bash
npx firebase deploy --only firestore:rules
```

`hd=hbplus.fit` only hints which Google account to suggest. It is not the access check: the app and Firestore still verify the email.

## Domain restriction

After every Google sign-in the app calls `evaluateAccess()`. The account must have:

- `emailVerified === true`
- an address whose domain is exactly `hbplus.fit`

Subdomains, look-alike domains, and unverified addresses are rejected. The session is signed out immediately and the screen shows:

> Access restricted. Please login using your official domain email.

Firestore rules require `request.auth.token.email_verified == true` and the same domain pattern before any profile can be read or written. A member can read and update only `users/{their uid}`. Collection listing and other paths are denied. Admin access requires the custom claim `role == "admin"` on a verified official account. A Gmail user with a forged admin claim still fails the domain check.

## Roles

Everyone starts as `user`. The client cannot promote itself. Stored profile updates are not allowed to change `role`.

Grant admin from a trusted machine with a Firebase service account:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json npm run set-role -- <uid> admin
```

The script refuses accounts that are not verified `@hbplus.fit` addresses. It sets the custom claim, updates the profile when one already exists, and revokes refresh tokens. That person signs in again, then taps **Refresh role** if a tab was already open.

Use `user` as the second argument to remove admin.

## Run

Web:

```bash
npm run web
```

Production web bundle:

```bash
npm run export:web
```

The export is written to `dist/` as a single-page app. `netlify.toml` publishes that directory and redirects every path to `index.html`. In Netlify, set the same `EXPO_PUBLIC_*` variables before the build. They are inlined into the bundle.

Android and iOS need a development or store build. Expo Go does not include the native Google Sign-In module.

```bash
npx expo run:android
npx expo run:ios
```

Cloud builds:

```bash
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios
```

Native sessions persist in AsyncStorage through Firebase Auth. Web sessions persist in browser local storage. Signing out clears the Firebase session and, on a device, the Google Sign-In session.

## Checks

```bash
npm run typecheck
npm test
npm run test:rules
```

`npm test` covers the domain gate, role claims, profile writes, and route decisions. `npm run test:rules` starts the Firestore emulator and checks that anonymous users, other domains, unverified official addresses, and forged admin claims cannot read or write protected data. The rules test needs Java 21. Homebrew keeps it off the default `PATH`:

```bash
brew install openjdk@21
export JAVA_HOME="$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
```

## Screens

- **Login** (`/login`) starts Google sign-in and shows configuration, cancellation, and domain errors.
- **Dashboard** (`/`) is a protected route with the signed-in account, the Firestore profile, and the admin directory when the claim allows it.
- **Profile** (`/profile`) shows the account and stored profile.
- **Log out** is available from the header, dashboard, and profile.
