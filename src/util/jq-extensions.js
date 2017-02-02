jQuery.fn.extend({
    isNode: function (nodeTypeName) {
        nodeTypeName = nodeTypeName.toUpperCase();

        if (this.length == 0 || nodeTypeName.length == 0) {
            // There is nothing in the selector
            return false;
        }

        return ($(this).prop('nodeName').toUpperCase() === nodeTypeName);
    }
});