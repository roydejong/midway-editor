/**
 * A reusable instance of a toolbar button.
 * @constructor
 */
var MidwayToolbarButton = function (id, label, applyFunction, queryStateFunction) {
    this.id = id;
    this.label = "Button";

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
    } else {
        console.warn('Midway Editor: You must implement MidwayToolbarButton.apply()');
    }

    if (queryStateFunction) {
        this.queryState = queryStateFunction;
    } else {
        console.warn('Midway Editor: You should implement MidwayToolbarButton.queryState()');
    }
};