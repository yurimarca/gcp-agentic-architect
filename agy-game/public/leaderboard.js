/**
 * Voyager Leaderboard Engine (Agent B - Social & Persistence Layer)
 * Handles Firebase initialization, Firestore queries, high-score submission, and UI overlay management.
 */

window.Voyager = window.Voyager || {};

(function() {
  let db = null;
  let auth = null;
  let currentUser = null;
  let currentScoreToSubmit = null;
  let hasSubmittedScore = false;

  /**
   * Initializes Firebase Firestore & Anonymous Auth using Firebase Hosting reserved app instance.
   */
  function initFirebase() {
    try {
      if (typeof firebase !== 'undefined' && firebase.app) {
        const app = firebase.app();
        db = app.firestore();
        auth = app.auth();

        auth.signInAnonymously().then((userCredential) => {
          currentUser = userCredential.user;
        }).catch((error) => {
          console.error("Anonymous auth error:", error);
        });
        return true;
      }
    } catch (err) {
      console.error("Error initializing Firebase in leaderboard.js:", err);
    }
    return false;
  }

  // Attempt early initialization
  if (!initFirebase()) {
    window.addEventListener('DOMContentLoaded', initFirebase);
  }

  function getFirestore() {
    if (!db && typeof firebase !== 'undefined' && firebase.app) {
      db = firebase.app().firestore();
    }
    return db;
  }

  function getAuth() {
    if (!auth && typeof firebase !== 'undefined' && firebase.app) {
      auth = firebase.app().auth();
    }
    return auth;
  }

  /**
   * Fetches top 10 scores from Firestore 'scores' collection, ordered by score descending.
   */
  async function fetchTopScores() {
    const firestore = getFirestore();
    if (!firestore) {
      console.warn("Firestore instance not ready yet");
      return [];
    }

    try {
      const snapshot = await firestore.collection('scores')
        .orderBy('score', 'desc')
        .limit(10)
        .get();

      const scores = [];
      snapshot.forEach(doc => {
        scores.push(doc.data());
      });
      return scores;
    } catch (err) {
      console.error("Error fetching leaderboard scores:", err);
      return [];
    }
  }

  /**
   * Saves a score document to Firestore 'scores' collection.
   */
  async function saveScore(initials, score) {
    const firestore = getFirestore();
    if (!firestore) {
      console.error("Firestore not available for saving score");
      return false;
    }

    const authInstance = getAuth();
    const uid = currentUser ? currentUser.uid : (authInstance && authInstance.currentUser ? authInstance.currentUser.uid : '');
    
    // Sanitize to exactly 3 uppercase letters (must match firestore.rules)
    const sanitizedInitials = (initials || '').toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3).padEnd(3, 'A');

    const scoreDoc = {
      name: sanitizedInitials,
      score: Math.floor(score),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid
    };

    try {
      await firestore.collection('scores').add(scoreDoc);
      return true;
    } catch (err) {
      console.error("Error saving score to Firestore:", err);
      return false;
    }
  }

  /**
   * Escapes HTML special characters in Firestore-sourced strings before rendering.
   */
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  /**
   * Renders the leaderboard screen content inside #leaderboard-container
   */
  async function renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    let html = '';

    // Render score submission box if player has a score to submit and hasn't submitted yet
    if (currentScoreToSubmit !== null && !hasSubmittedScore) {
      html += `
        <div class="lb-submission-box">
          <div class="lb-submission-title">NEW HIGH SCORE!</div>
          <div class="lb-score-display">SCORE: ${Math.floor(currentScoreToSubmit)}</div>
          <form id="score-submit-form" class="lb-form">
            <input type="text" id="player-initials" class="lb-initials-input" maxlength="3" placeholder="AAA" required autocomplete="off" autofocus />
            <button type="submit" id="btn-submit-score" class="arcade-btn">SUBMIT</button>
          </form>
        </div>
      `;
    } else if (hasSubmittedScore) {
      html += `
        <div class="lb-saved-msg">✓ SCORE TRANSMITTED TO ZARGABORG BASE!</div>
      `;
    }

    // Leaderboard table container placeholder
    html += `<div id="lb-table-wrapper"><div class="lb-empty-msg">LOADING HIGH SCORES...</div></div>`;
    html += `<div class="lb-enter-prompt">PRESS [ENTER] TO PLAY AGAIN</div>`;

    container.innerHTML = html;

    // Attach event listener for score submission form
    const scoreForm = document.getElementById('score-submit-form');
    if (scoreForm) {
      const initialsInput = document.getElementById('player-initials');
      if (initialsInput) initialsInput.focus();

      scoreForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-score');
        if (submitBtn) submitBtn.disabled = true;

        const initials = initialsInput ? initialsInput.value : 'AAA';
        const success = await saveScore(initials, currentScoreToSubmit);
        if (success) {
          hasSubmittedScore = true;
        }
        await renderLeaderboard();
      });
    }

    // Fetch and populate top 10 scores
    const topScores = await fetchTopScores();
    const tableWrapper = document.getElementById('lb-table-wrapper');
    if (!tableWrapper) return;

    if (topScores.length === 0) {
      tableWrapper.innerHTML = `<div class="lb-empty-msg">NO HIGH SCORES RECORDED YET.<br>BE THE FIRST EXPLORER!</div>`;
    } else {
      let tableHtml = `
        <table class="lb-table">
          <thead>
            <tr>
              <th>RANK</th>
              <th>NAME</th>
              <th>SCORE</th>
            </tr>
          </thead>
          <tbody>
      `;

      topScores.forEach((entry, index) => {
        const rank = index + 1;
        const rankClass = rank === 1 ? 'lb-rank-1' : (rank === 2 ? 'lb-rank-2' : (rank === 3 ? 'lb-rank-3' : ''));
        const name = escapeHtml(String(entry.name || '---').toUpperCase());
        const scoreVal = Number.isFinite(entry.score) ? Math.floor(entry.score) : 0;

        tableHtml += `
          <tr class="${rankClass}">
            <td>#${rank}</td>
            <td>${name}</td>
            <td>${scoreVal}</td>
          </tr>
        `;
      });

      tableHtml += `
          </tbody>
        </table>
      `;
      tableWrapper.innerHTML = tableHtml;
    }
  }

  /**
   * Main entry point required by global contract:
   * window.Voyager.showLeaderboard(score)
   */
  window.Voyager.showLeaderboard = function(score) {
    if (score !== undefined && score !== null && typeof score === 'number') {
      currentScoreToSubmit = score;
      hasSubmittedScore = false;
    }

    // Hide all other overlays
    const overlays = ['start-screen', 'fail-screen', 'win-screen'];
    overlays.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // Reveal #leaderboard-screen overlay
    const lbScreen = document.getElementById('leaderboard-screen');
    if (lbScreen) {
      lbScreen.style.display = 'flex';
    }

    // Render leaderboard screen
    renderLeaderboard();
  };

  /**
   * Restart game helper
   */
  function triggerGameRestart() {
    const lbScreen = document.getElementById('leaderboard-screen');
    if (lbScreen) {
      lbScreen.style.display = 'none';
    }

    if (typeof window.Voyager.resetGame === 'function') {
      window.Voyager.resetGame();
    }
  }

  // Bind DOM elements on load
  function bindUI() {
    const restartBtn = document.getElementById('btn-restart-game');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        triggerGameRestart();
      });
    }

    const winContinueBtn = document.getElementById('btn-win-continue');
    if (winContinueBtn) {
      winContinueBtn.addEventListener('click', () => {
        const scoreValEl = document.getElementById('final-score-val');
        let finalScore = 0;
        if (scoreValEl) {
          finalScore = parseInt(scoreValEl.textContent || '0', 10) || 0;
        }
        window.Voyager.showLeaderboard(finalScore);
      });
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bindUI);
  } else {
    bindUI();
  }

  // Global keydown handler for Enter key restart
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const lbScreen = document.getElementById('leaderboard-screen');
      if (lbScreen && lbScreen.style.display !== 'none') {
        const initialsInput = document.getElementById('player-initials');
        const isInputActive = initialsInput && document.activeElement === initialsInput && !hasSubmittedScore && currentScoreToSubmit !== null;

        // If not actively filling out the initials input, Enter key restarts the game
        if (!isInputActive) {
          e.preventDefault();
          triggerGameRestart();
        }
      }
    }
  });

})();
