// Saves options to chrome.storage.sync.
function save_options() {
    const excludeList = document.getElementById('exclude-list').value;
    const includeList = document.getElementById('include-list').value;
    chrome.storage.sync.set({
        blacklist: excludeList,
        whitelist: includeList
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 1750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        blacklist: 'google.com',
        whitelist: ''
    }, function(items) {
        document.getElementById('exclude-list').value = items.blacklist;
        document.getElementById('include-list').value = items.whitelist;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);