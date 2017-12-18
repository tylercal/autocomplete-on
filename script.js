/* global console, chrome */

(function() {
    "use strict";

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.target.getAttribute("autocomplete") !== "on") {
                m.target.setAttribute("autocomplete", "on");
            }
        });
    });

    var config = { attributes: true, attributeFilter: ["autocomplete"] };

    function completeOn() {
        var inputs = document.querySelectorAll("[autocomplete]");

        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            input.setAttribute("autocomplete", "on");
            observer.observe(input, config);
        }
        return {inputs: inputs, i: i, input: input};
    }

    function run() {
        chrome.storage.sync.get({
            blacklist: 'google.com'
        }, function(items) {
            var patterns = items.blacklist.split("\n");
            for (var i = 0; i < patterns.length; i++) {
                if (document.URL.indexOf(patterns[i]) > 0) {
                    return;
                }
            }
            completeOn();
        });
    }

    run();

    document.addEventListener('page:load', run);
    document.addEventListener('ready', run);
    document.addEventListener('turbolinks:load', run);
})();