/* global console, chrome */

(function() {
    "use strict";

    let mutationCount = 0;

    const loadObserver = new MutationObserver(function (mutations) {
        mutationCount++;
        mutations.forEach(function (m) {
            completeOn();
        });
        if (mutationCount > 100) { loadObserver.disconnect(); }
    });

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.target.getAttribute("autocomplete") !== "on") {
                m.target.setAttribute("autocomplete", "on");
            }
        });
    });

    const config = { attributes: true, attributeFilter: ["autocomplete"] };

    function completeOn() {
        const inputs = document.querySelectorAll("[autocomplete]");

        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            input.setAttribute("autocomplete", "on");
            observer.observe(input, config);
        }
    }

    function run() {
        chrome.storage.sync.get({
            blacklist: 'google.com',
            whitelist: ''
        }, function(items) {
            let patterns = items.whitelist.split("\n");
            let matchesWhitelist = items.whitelist === "";

            for (let i = 0; !matchesWhitelist && i < patterns.length; i++) {
                if (document.URL.indexOf(patterns[i]) >= 0) {
                    matchesWhitelist = true;
                }
            }

            if (!matchesWhitelist) return;

            patterns = items.blacklist.split("\n");
            for (let i = 0; i < patterns.length; i++) {
                if (document.URL.indexOf(patterns[i]) >= 0) {
                    return;
                }
            }
            completeOn();
            loadObserver.observe(document.body,
                {childList: true, subtree: true});
        });
    }

    run();

    document.addEventListener('page:load', run);
    document.addEventListener('ready', run);
    document.addEventListener('turbolinks:load', run);
    window.addEventListener('load', run);
})();