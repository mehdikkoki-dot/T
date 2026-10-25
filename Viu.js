/*
 * Viu.js
 *
 * Compatibility stub for the CloudStream Viu extension.
 *
 * BLOCKER:
 * The original extension requires POST authentication and custom
 * Authorization headers. The target environment only exposes
 * synchronous httpGet(url), which cannot perform those operations.
 *
 * This file deliberately does not fabricate search results or links.
 * No HTML extraction regexes are used in this stub.
 */

function search(query) {
    // Cannot search the authenticated Viu API with httpGet alone.
    return [];
}

function getMainPage() {
    // Cannot authenticate to retrieve Viu home-page sections.
    return [];
}

function load(url) {
    // Placeholder only: metadata has not been retrieved.
    return {
        name: "Viu item",
        url: url,
        year: null
    };
}

function loadLinks(url) {
    // Playback requires authenticated API requests and custom headers.
    return [];
}
