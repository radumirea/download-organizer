$(document).ready(function () {

    var rules = [];
    var custom_types = [];

    updateRuleContainer();
    updateCustomTypes();
    $("#conf").addClass("active");
    $("#conf_content").css('display', 'block');

    $("#add_rul").click(function () {
        var $folder = $("#folder");
        var $error = $("#error_path");
        var $type_el = $("#select_type");
        var type_t = $type_el.children("option:selected").val();
        var type_d = $type_el.children("option:selected").text().trim();
        var folder = $folder.val();
        if (!folder.match("^(?!([a-zA-Z]:))(?!\\\\|\\/)(?!.*(\\/\\.\\.\\/|\\\\\\.\\.\\\\)).*")) {
            $error.css("display", "block");
            $folder.addClass("error");
            return;
        }
        $folder.removeClass("error");
        $error.css("display", "none");
        chrome.storage.local.get("rules", function (item) {
            rules = item.rules;
            if (!rules) {
                rules = [];
            }
            if (folder === "") {
               folder = ".";
            }
            rules.push({type_t: type_t, type_d: type_d, folder: folder});
            chrome.storage.local.set({"rules": rules});
            $("#folder").val("");
        });
    });

    $("#add_type").click(function () {
        var $mime_type = $("#mime_type");
        var $label = $("#label");
        var $error = $("#error_custom");
        var mime = $mime_type.val();
        var label = $label.val();
        $mime_type.removeClass("error");
        $label.removeClass("error");
        if (!mime || 0 === mime.length || !label || 0 === label.length) {
            $error.css("display", "block");
            if(!mime || 0 === mime.length){
                $mime_type.addClass("error");
            }
            if(!label || 0 === label.length){
                $label.addClass("error");
            }
            return;
        }
        $error.css("display", "none");
        chrome.storage.local.get("custom_types", function (item) {
            custom_types = item.custom_types;
            if (!custom_types) {
                custom_types = [];
            }
            custom_types.push({mime: mime, label: label});
            chrome.storage.local.set({"custom_types": custom_types});
            $mime_type.val("");
            $label.val("");
        });
    });

    function updateRuleContainer() {
        chrome.storage.local.get("rules", function (item) {
            rules = item.rules;
            if (!rules) {
                rules = [];
            }
            $("#rules").html("<tr><th><div>File type</div></th><th><div>Folder</div></th><th class='actions'><div>Actions</div></th></tr>");
            rules.forEach(function (rule) {
                var $delete_button = $("<button title='Delete' class='delete_button action'><i class='icon-clear'></i></button>").click(function () {
                    var index = this.parentElement.parentElement.rowIndex - 1;
                    rules.splice(index, 1);
                    chrome.storage.local.set({"rules": rules});
                });
                var $up_button = $("<button title='Increase priority' class='action'><i class='icon-expand_less'></i></button>").click(function () {
                    var index = this.parentElement.parentElement.rowIndex - 1;
                    var items = rules.splice(index, 1);
                    rules.splice(index - 1, 0, items[0]);
                    chrome.storage.local.set({"rules": rules});
                });
                var $down_button = $("<button title='Decrease priority' class='action'><i class='icon-expand_more'></i></button>").click(function () {
                    var index = this.parentElement.parentElement.rowIndex - 1;
                    var items = rules.splice(index, 1);
                    rules.splice(index + 1, 0, items[0]);
                    chrome.storage.local.set({"rules": rules});
                });

                var $action_rule = $("<td class='actions'></td>").append($delete_button, $up_button, $down_button);
                var $row = $("<tr><td><div class='fixed'>" + rule.type_d + "</div></td><td><div class='fixed'>" + rule.folder + "</div></td></tr>");
                $row.append($action_rule);
                $("#rules").append($row);
            });
        });
    }

    function updateCustomTypes() {
        chrome.storage.local.get("custom_types", function (item) {
            $("#custom_types").html("<tr><th><div>MIME type</div></th><th><div>Label</div></th><th class='actions'><div>Actions</div></th></tr>");
            custom_types = item.custom_types;
            if (!custom_types) {
                custom_types = [];
            }
            $("#select_type").children(".custom").remove();
            if (custom_types.length > 0) {
                $("#select_type").append("<option value='custom' class='group custom'>Custom</option>")
            }
            custom_types.forEach(function (custom_type) {
                var $delete_button = $("<button title='Delete' class='delete_button action'><i class='icon-clear'></i></button>").click(function () {
                    var index = this.parentElement.parentElement.rowIndex - 1;
                    custom_types.splice(index, 1);
                    chrome.storage.local.set({"custom_types": custom_types});
                });

                var $actions = $("<td class='actions'></td>").append($delete_button);
                var $row = $("<tr><td><div class='fixed2'>" + custom_type.mime + "</div></td><td><div class='fixed2'>" + custom_type.label + "</div></td></tr>");
                $row.append($actions);
                $("#custom_types").append($row);
                $("#select_type").append("<option class='custom' value='" + custom_type.mime + "'>" +
                    "&nbsp;&nbsp;" + custom_type.label + "</option>")
            });
        });
    }

    chrome.storage.onChanged.addListener(function () {
        updateRuleContainer();
        updateCustomTypes();
    });

    $(".tablinks").click(function openTab() {
        $(".tablinks").removeClass("active");
        $(".tabcontent").css('display', 'none');
        $(this).addClass("active");
        $("#" + $(this).attr("id") + "_content").css('display', 'block');
    });

    $('body').on('click', 'a', function(){
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
    });

});
