# Scheduler

A personal weekly planner: today's schedule with tasks in their time blocks, the week at a glance, a four-week house chore rotation with seasonal maintenance, to-dos that carry over, and a history of what got done.

It is a static website (plain HTML, CSS and JavaScript, no build step). Checkmarks and to-dos sync between devices through Firebase, and you sign in with Google. It can be installed on a phone's home screen and works offline.

## Files

| File | What it is |
|---|---|
| `index.html`, `styles.css` | The page |
| `app.js` | Schedule, chore rotation, views and sync. The schedule, every-week chores and rotation are the `SCHEDULE`, `WEEKLY` and `ROT` lists near the top. |
| `firebase-config.js` | Your Firebase project's web config (fill in during setup) |
| `firestore.rules` | Database rules: each account can only see its own data |
| `sw.js`, `manifest.webmanifest`, `icon*` | Install-to-home-screen and offline support |

## Run it locally

Until `firebase-config.js` is filled in, the app saves to the current browser only, which is fine for trying it out.

```bash
python -m http.server 8765
```

Then open http://localhost:8765. Opening `index.html` directly from the file system does not work, because browsers block JavaScript modules on `file://`.

## Setup (one time, about 15 minutes)

### 1. Create the Firebase project

1. Go to https://console.firebase.google.com and click **Create a project**. Any name works, for example `scheduler`. Google Analytics is not needed.
2. **Build > Authentication > Get started**, then under **Sign-in method** enable **Google**.
3. **Build > Firestore Database > Create database**. Pick a location near you (for example `northamerica-northeast1` for Montréal or `northamerica-northeast2` for Toronto) and start in **production mode**.
4. In Firestore, open the **Rules** tab, replace the contents with `firestore.rules` from this repo, and click **Publish**.
5. **Project settings** (gear icon) > **General** > **Your apps** > the web icon `</>`. Register an app (no Firebase Hosting needed). Copy the `firebaseConfig` values into `firebase-config.js`.

These config values are not secret. They identify the project; the rules and Google sign-in protect the data. It is fine to commit them.

### 2. Publish on GitHub Pages

1. Create an empty GitHub repository, for example `scheduler`, and push this folder to it.
2. In the repository: **Settings > Pages > Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
3. After a minute the site is at `https://<your-username>.github.io/scheduler/`.

### 3. Allow sign-in from the site

In Firebase: **Authentication > Settings > Authorized domains > Add domain**, and add `<your-username>.github.io`. `localhost` is already on the list.

### 4. Install on your phone

- **iPhone (Safari):** open the site, tap Share, then **Add to Home Screen**.
- **Android (Chrome):** open the site, tap the menu, then **Install app** or **Add to Home screen**.

Sign in once on each device.

## Locking it to your account (optional)

The rules already stop anyone from reading your data. Someone else who finds the site could still sign in and keep their own separate list in your Firebase project. To block that, change the rule's condition to:

```
allow read, write: if request.auth != null && request.auth.uid == uid
                   && request.auth.token.email == "YOUR_EMAIL";
```

Paste it into the Firestore **Rules** tab only. Keep your email out of the copy in this repo, since the repo is public.

## Changing the schedule or chores

Edit `SCHEDULE`, `WEEKLY` or `ROT` in `app.js`, then push. Each checkmark is tied to the item's wording (rotation items) or its id (every-week items), so renaming an item clears its checkmark for the current period only.

After a push, the site updates on the next load. If a phone keeps showing the old version, close the app fully and reopen it.

## Free tier

Firebase's free Spark plan is far more than one person needs here: about 50,000 reads and 20,000 writes a day, and 1 GB of storage.
