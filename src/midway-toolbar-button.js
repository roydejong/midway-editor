/**
 * A reusable instance of a toolbar button.
 * @constructor
 */
var MidwayToolbarButton = function (id, label) {
    this.id = id;
    this.label = "Button";
    this.icon = this.id;
    this.style = '';

    if (label) {
        this.label = label;
    }

    this.apply = function (midway, selection) {
        // To be implemented by user
        return false;
    };

    this.queryState = function (midway, selection) {
        // To be implemented by user
        return false;
    };
};