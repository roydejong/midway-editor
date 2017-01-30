/**
 * Midway editor static functions.
 */
var Midway = {
    edit: function (selector) {
        MidwayToolbar.prepareOnPage();

        var $target = $(selector);

        if ($target.length == 0) {
            console.error('Midway Editor: Could not find editable target:', selector);
            return null;
        }

        var newEditors = [];

        $target.each(function () {
            var $editorDiv = $(this);
            var midwayEditor = new MidwayEditor($editorDiv);

            newEditors.push(midwayEditor);

            window.midwayInstance = midwayEditor;
        });

        if (newEditors.length == 1) {
            return newEditors[0];
        } else {
            console.warn('Midway Editor: Found multiple targets with selector, making each editable:', selector);
            return newEditors;
        }
    }
};