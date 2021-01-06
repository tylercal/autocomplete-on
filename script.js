/* global console */

const COMPLETES = new Set([
    "on",
    "name",
    "honorific-prefix",
    "given-name",
    "additional-name",
    "family-name",
    "honorific-suffix",
    "nickname",
    "username",
    "new-password",
    "current-password",
    "one-time-code",
    "organization-title",
    "organization",
    "street-address",
    "address-line1",
    "address-line2",
    "address-line3",
    "address-level4",
    "address-level3",
    "address-level2",
    "address-level1",
    "country",
    "country-name",
    "postal-code",
    "cc-name",
    "cc-given-name",
    "cc-additional-name",
    "cc-family-name",
    "cc-number",
    "cc-exp",
    "cc-exp-month",
    "cc-exp-year",
    "cc-csc",
    "cc-type",
    "transaction-currency",
    "transaction-amount",
    "language",
    "bday",
    "bday-day",
    "bday-month",
    "bday-year",
    "sex",
    "url",
    "photo",
    "tel",
    "tel-country-code",
    "tel-national",
    "tel-area-code",
    "tel-local",
    "tel-local-prefix",
    "tel-local-suffix",
    "tel-extension",
    "email",
    "impp"
]);

(function() {
    "use strict";

    let mutationCount = 0;

    const loadObserver = new MutationObserver(function (mutations) {
        mutationCount++;
        mutations.forEach(() => completeOn());
        if (mutationCount > 100) { loadObserver.disconnect(); }
    });

    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            chooseComplete(m.target);
        });
    });

    const config = { attributes: true, attributeFilter: ["autocomplete"] };

    function chooseComplete(input) {
        if (!COMPLETES.has(input.getAttribute("autocomplete"))) {
            const hint = (input.name + input.id).toLowerCase()
            let value = "on"
            if (hint.includes("user")) value = "username"
            if (hint.includes("email")) value = "email"

            input.setAttribute("autocomplete", value);
        }
    }

    function completeOn() {
        const inputs = document.querySelectorAll("[autocomplete]");

        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            chooseComplete(input);
            observer.observe(input, config);
        }
    }

    function run() {
        chrome.storage.sync.get({
            blacklist: 'google.com',
            whitelist: ''
        }, items => {
            let patterns = items.whitelist.split("\n");
            let matchesIncludeList = items.whitelist === "";

            for (let i = 0; !matchesIncludeList && i < patterns.length; i++) {
                if (document.URL.indexOf(patterns[i]) >= 0) {
                    matchesIncludeList = true;
                }
            }

            if (!matchesIncludeList) return;

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