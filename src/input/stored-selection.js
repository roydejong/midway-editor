/**
 * Data class for storing selection ranges.
 * This is necessary because the "selection" object magically changes according to the browser's current state.
 *
 * @param selectionData The current Selection object to extract data from.
 * @constructor
 */
var MidwayStoredSelection = function (selectionData) {
    this.ranges = [];

    if (selectionData.type = "Range" && selectionData.rangeCount > 0) {
        for (var i = 0; i < selectionData.rangeCount; i++) {
            this.ranges.push(selectionData.getRangeAt(i));
        }
    }

    this.rangeCount = this.ranges.length;

    this.getRangeAt = function (i) {
        return this.ranges[i];
    }
};