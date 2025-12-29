/* eslint-disable no-restricted-globals */
/* global self, importScripts, firebase */

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Config from .env.local (Hardcoded for SW)
// This is safe as these keys are public.
const firebaseConfig = {
    apiKey: "AIzaSyCJ12etoUPLytv8B8EtdxiXEpMb_SkHpb8",
    authDomain: "bo-restaurant-os.firebaseapp.com",
    projectId: "bo-restaurant-os",
    storageBucket: "bo-restaurant-os.firebasestorage.app",
    messagingSenderId: "174733458826",
    appId: "1:174733458826:web:47840406435a77761f1c73"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Background Message Handler
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);

        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/favicon.ico', // Use brand icon if available
            data: payload.data
        };

        // Show notification
        self.registration.showNotification(notificationTitle, notificationOptions);
    });

    self.addEventListener('notificationclick', function (event) {
        console.log('[firebase-messaging-sw.js] Notification click Received.', event);
        event.notification.close();

        const urlToOpen = event.notification.data?.url || '/';

        event.waitUntil(
            self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then(function (clientList) {
                // If a window is already open, focus it
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
        );
    });

} catch (e) {
    console.error('Firebase SW Initialization Error', e);
}
