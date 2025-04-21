importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore-compat.js');

const firebaseConfig = { /* your config */ };
firebase.initializeApp(firebaseConfig);

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-projects') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        return clients[0].postMessage({ type: 'TRIGGER_SYNC' });
      })
    );
  }
}); 