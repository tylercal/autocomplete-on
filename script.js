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

const querySelectorAll = (node, selector) => {
    const nodes = [...node.querySelectorAll(selector)];
    const nodeIterator = document.createNodeIterator(node, Node.ELEMENT_NODE);
    let currentNode;
    while ((currentNode = nodeIterator.nextNode())) {
        if (currentNode.shadowRoot) {
            nodes.push(...querySelectorAll(currentNode.shadowRoot, selector));
        }
    }
    return nodes;
};

(function() {
    "use strict";

    let mutationCount = 0;
    let allInputs = false;

    const loadObserver = new MutationObserver(function (mutations) {
        mutationCount ++
        debounce(completeOn)
        if (mutationCount > 100) { loadObserver.disconnect(); }
    });

    function debounce(func, timeout = 500){
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

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
            if (hint.includes("mail")) value = "email"
            if (hint.includes("phone")) value = "tel"

            input.setAttribute("autocomplete", value);
        }
    }

    function completeOn() {
        const inputs = allInputs ?
            querySelectorAll(document, "input:not([type=hidden])") : querySelectorAll(document,"[autocomplete]:not([type=hidden])");
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            chooseComplete(input);
            observer.observe(input, config);
        }
    }

    function run() {
        chrome.storage.sync.get({
            blacklist: 'google.com',
            whitelist: '',
            allInputs: false
        }, items => {
            allInputs = items.allInputs;
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
            completeOn()
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