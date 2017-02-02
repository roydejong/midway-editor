jQuery.fn.extend({
    /**
     * Gets whether the current selector points to a node with the specified nodeName.
     *
     * Example use case: Determine whether our current editor node is a headline $x.isNode('h1') or a paragraph $x.isNode('p').
     *
     * @param acceptableNodeNames {string|object} Name(s) of acceptable node names
     * @returns {boolean}
     */
    isNode: function (acceptableNodeNames) {
        if (!this || this.length == 0) {
            // There is nothing in the selector
            return false;
        }

        if (typeof acceptableNodeNames != 'object') {
            // A primitive value was passed, autoconstruct array
            acceptableNodeNames = [acceptableNodeNames];
        }

        for (var i = 0; i < acceptableNodeNames.length; i++) {
            var nodeTypeName = acceptableNodeNames[i];
            nodeTypeName = nodeTypeName.toUpperCase();

            if (this.prop('nodeName').toUpperCase() === nodeTypeName) {
                return true;
            }
        }

        return false;
    }
});