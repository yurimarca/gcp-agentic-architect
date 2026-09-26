/**
 * Mock Exam leaderboard (persistence layer).
 * Uses the Firebase app auto-initialized by Hosting reserved URLs (/__/firebase/init.js),
 * signs in anonymously, and reads/writes the `exam_scores` collection.
 * If Firebase is unavailable (e.g. page opened from disk), every call resolves to null
 * and the UI shows the leaderboard as offline. The exam itself never depends on Firebase.
 */

/**
 * App Check (reCAPTCHA Enterprise) site key. Public by design, safe to commit.
 * Leave empty to disable App Check.
 */
const RECAPTCHA_ENTERPRISE_SITE_KEY = '';

window.ExamBoard = (function () {
  const COLLECTION = 'exam_scores';
  let db = null;
  let authReady = null;
  let appCheckActivated = false;

  function activateAppCheck() {
    if (appCheckActivated || typeof firebase === 'undefined' || !firebase.appCheck) return;
    appCheckActivated = true;
    if (!RECAPTCHA_ENTERPRISE_SITE_KEY) return;
    if (['localhost', '127.0.0.1'].includes(location.hostname)) {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    try {
      firebase.appCheck().activate(new firebase.appCheck.ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY), true);
    } catch (err) {
      console.error('App Check activation failed:', err);
    }
  }

  function init() {
    if (db) return true;
    try {
      if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return false;
      activateAppCheck();
      const app = firebase.app();
      db = app.firestore();
      // Local development: talk to the Firestore emulator (see firebase.json) instead of production.
      if (['localhost', '127.0.0.1'].includes(location.hostname)) db.useEmulator('127.0.0.1', 8080);
      authReady = app.auth().signInAnonymously().then((cred) => cred.user).catch((err) => {
        console.error('Anonymous auth failed:', err);
        return null;
      });
      return true;
    } catch (err) {
      console.warn('Firebase not available, leaderboard offline:', err);
      return false;
    }
  }

  async function fetchTop(limit = 10) {
    if (!init()) return null;
    try {
      // Single-field ordering (no composite index needed); tie-break on time client-side.
      const snap = await db.collection(COLLECTION).orderBy('scorePct', 'desc').limit(50).get();
      const rows = [];
      snap.forEach((doc) => rows.push(doc.data()));
      rows.sort((a, b) => b.scorePct - a.scorePct || a.durationSec - b.durationSec);
      return rows.slice(0, limit);
    } catch (err) {
      console.error('Leaderboard fetch failed:', err);
      return null;
    }
  }

  /** entry: { name, correct, durationSec } for a completed full (50-question) exam. */
  async function submit(entry) {
    if (!init()) return { ok: false, error: 'Leaderboard is offline.' };
    const user = await authReady;
    if (!user) return { ok: false, error: 'Could not sign in anonymously.' };
    const doc = {
      name: entry.name,
      correct: entry.correct,
      total: 50,
      scorePct: entry.correct * 2,
      durationSec: Math.max(60, Math.min(7200, Math.round(entry.durationSec))),
      uid: user.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };
    try {
      await db.collection(COLLECTION).add(doc);
      return { ok: true };
    } catch (err) {
      console.error('Score submit failed:', err);
      return { ok: false, error: 'Submission was rejected.' };
    }
  }

  return { fetchTop, submit, isOnline: () => init() };
})();
