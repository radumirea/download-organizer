var rules = [];

function updateRules() {
    chrome.storage.local.get("rules", function (item) {
        if (item) {
            rules = item.rules;
            if (!rules) {
                chrome.storage.local.set({"rules": [{"folder": "pdfs", "type_d": "Pdf", "type_t": "application/pdf"},
                        {"folder": "archives/zip", "type_d": "Zip", "type_t": "application/zip"}]});
            }
        }
    });
}

updateRules();

chrome.storage.onChanged.addListener(function () {
    updateRules();
});

chrome.downloads.onDeterminingFilename.addListener(
    function (item, suggest) {
        var folder = "";
        rules.some(function (rule) {
            if (item.mime.indexOf(rule.type_t) === 0) {
                folder = rule.folder + "/";
                return true;
            }
        });
        suggest({
            filename: folder + item.filename,
            conflict_action: 'overwrite',
            conflictAction: 'overwrite'
        });
    });
