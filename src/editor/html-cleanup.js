var MidwayHtmlCleanup = {
    cleanNode: function (midway, $node) {
        var isTitleNode = $node.isNode(['h1', 'h2', 'h3']);
        var nodeHtml = $node.html();
        var nodeIsBlank = $node.text().trim() == '' && !$node.hasClass('ghost-node');

        var H1_PLACEHOLDER_TEXT = 'Title';

        // Clean up for blank titles that are unusable due to "just" having empty <br>s
        if (nodeIsBlank && isTitleNode) {
            $node.html('');

            // Special fixes & placeholder behavior for <h1> node
            if ($node.is('h1')) {
                $node
                    .text(H1_PLACEHOLDER_TEXT)
                    .data('placeholder', H1_PLACEHOLDER_TEXT)
                    .removeClass('midway-zw-hack')
                    .addClass('ghost-node');
            }
        }
        
        // This is a ghost node, unghost it if the user has ruined it
        if ($node.hasClass('ghost-node')) {
            var textLenDiff = $node.text().length - $node.data('placeholder').length;

            if (textLenDiff > 0) {
                $node.text($node.text().substring(0, textLenDiff));
                $node.removeClass('ghost-node');

                if (midway.$lastUserNode == $node) {
                    midway.caretSetPos($node, $node.text().length);
                }
            }
        }

        // Destroy <span> elements created by browsers, this prevents a lot of unwanted contenteditable behavior
        $node.find('span').each(function () {
            var $span = $(this);
            $span.replaceWith($span.text());
        });

        // Kill any of content editable's little "style" hacks
        $node.find('*').attr('style', '');
    }
};