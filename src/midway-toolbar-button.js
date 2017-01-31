/**
 * A reusable instance of a toolbar button.
 * @constructor
 */
var MidwayToolbarButton = function (id, label, applyFunction, queryStateFunction) {
    this.id = id;
    this.label = "Button";
    this.icon = this.id;

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

    if (applyFunction) {
        this.apply = applyFunction;
    }

    if (queryStateFunction) {
        this.queryState = queryStateFunction;
    }
};