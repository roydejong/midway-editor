/**
 * Midway Editor instance.
 *
 * @constructor
 */
var MidwayEditor = function ($rootDiv, options) {
    /**
     * The options this editor has been configured with.
     *
     * @var MidwayOptions
     */
    this.options = options;

    /**
     * The editable jQuery root element for the editor, it is made content editable.
     * Its direct children are the <h1>s and <p>s of this world.
     */
    this.$rootDiv = $rootDiv;

    /**
     * The generated or detected <h1> post title node.
     */
    this.$titleNode = null;

    /**
     * Tracks which node the user is about to move on to in events.
     * This is set on mouse events and used for subsequent input handling.
     * If the value is NULL, the active node is determined with MidwayEditor.caretGetNode().
     */
    this.$nextUserNode = null;

    /**
     * Tracks the last node the caret was known to be on.
     */
    this.$lastUserNode = null;

    /**
     * Initializes the Midway Editor and enables edit mode for the target div.
     * Sets up events, prepares input ,etc.
     */
    this.begin = function () {
        var midway = this;

        // Create placeholder title & content tags as needed
        this.checkPlaceholders();

        // Enable content editable mode for our div
        this.$rootDiv.attr('contenteditable', true);

        // Begin listening to user input events
        $('html').on('click', function () {
            midway.checkSelection();
        });

        MidwayTooltip.register(this.$rootDiv, 'a');

        this.$rootDiv.on('mousedown.midway', function (e) {
            var $targetNode = $(e.target);
            var preventingDefault = false;

            if ($targetNode.hasClass('ghost-node')) {
                preventingDefault = true;
            }

            if (preventingDefault) {
                e.preventDefault();
            }

            midway.$nextUserNode = $targetNode;
            midway.checkCaret();

            return !preventingDefault;
        });

        this.$rootDiv.on('mouseup.midway', function (e) {
            midway.checkCaret();
        });

        this.$rootDiv.on('click.midway', function () {
            midway.checkCaret();
        });

        this.$rootDiv.on('keydown.midway', function (e) {
            midway.$nextUserNode = null;

            if (e.keyCode == 13) {
                if (midway.$lastUserNode) {
                    if (midway.$lastUserNode.isNode(['h1', 'h2', 'h3', 'blockquote'])) {
                        // We are pressing return in a post heading or blockquote, block browser behavior and skip to the next <p> node
                        e.preventDefault();

                        var $nextEditorElement = midway.$lastUserNode.next();

                        if ($nextEditorElement.length == 0) {
                            // There is no next node to jump into, so create a new paragraph
                            $nextEditorElement = $('<p />');
                            $nextEditorElement.append('&nbsp;');
                            $nextEditorElement.appendTo(midway.$rootDiv);
                        }

                        midway.caretSetPos($nextEditorElement, 0);
                        return false;
                    } else if (midway.$lastUserNode.isNode('p') && midway.$lastUserNode.hasClass('ghost-node')) {
                        // We are pressing return in the first paragraph and there's no page content yet
                        // Ignore it, we don't want node inseration here
                        e.preventDefault();
                        return false;
                    }
                }
            } else if ((e.keyCode == 8 || e.keyCode == 46) && midway.$lastUserNode && midway.$lastUserNode.hasClass('ghost-node')) {
                // We are pressing backspace or delete on an empty ghost node
                // Jump back to prev element if it is also a ghost node, otherwise do nothing
                e.preventDefault();

                var $prevEditorElement = midway.$lastUserNode.prev();
                
                if ($prevEditorElement.length > 0) {
                    midway.caretSetPos($prevEditorElement, $prevEditorElement.text().length);
                }

                return false;
            }

            midway.checkCaret();
        });

        this.$rootDiv.on('input.midway', function (e) {
            midway.$nextUserNode = null;
            midway.contentChanging();
            midway.checkCaret();
        });

        this.$rootDiv.on('keyup.midway', function () {
            midway.$nextUserNode = null;
            midway.contentChanging();
            midway.checkCaret();
        });

        // If the editor already has content, clean it up now
        this.$rootDiv.children().each(function () {
            MidwayHtmlCleanup.cleanNode(midway, $(this));
        });
    };

    this.contentChanging = function () {
        if (this.$lastUserNode && this.$lastUserNode.length > 0) {
            MidwayHtmlCleanup.cleanNode(this, this.$lastUserNode);
        }
    };

    this.checkCaret = function () {
        var $caretNode = this.$nextUserNode ? this.$nextUserNode : this.caretGetNode();

        this.checkPlaceholders();

        if ($caretNode.hasClass('ghost-node')) {
            // This is a "ghost node" (a placeholder), so behave like a placeholder and keep the caret at pos-zero
            this.caretSetPos($caretNode, 0);
        }

        // Run the selection code async to prevent weird timing issues with window.getSelection()
        window.setTimeout(function () {
            this.checkSelection($caretNode);
        }.bind(this), 50);

        this.$lastUserNode = $caretNode;
    };

    this.checkSelection = function ($targetNode) {
        var selection = window.getSelection();

        if (selection.type != "Range") {
            // This is not a range selection, simply a caret position or something out of our league
            MidwayToolbar.hide();
            return;
        }

        MidwayToolbar.show(this, selection);
    };

    this.checkPlaceholders = function () {
        // Check if a title div exists on top of the post, and create it if needed
        var $firstChild = this.$rootDiv.children().first();

        if (!$firstChild || !$firstChild.isNode('h1')) {
            this.$titleNode = $('<h1 />')
                .prependTo(this.$rootDiv);

            $firstChild = this.$titleNode;
        }

        MidwayHtmlCleanup.cleanNode(this, $firstChild);

        // Check that at least one <p> child exists to begin containing body text, create if needed
        var $anyNonEmptyPs = this.$rootDiv.find('p').not(':empty');

        if ($anyNonEmptyPs.length == 0) {
            //
            this.$rootDiv.find('p').remove();

            var P_PLACEHOLDER_TEXT = 'Tell your story...';

            $('<p />')
                .text(P_PLACEHOLDER_TEXT)
                .data('placeholder', P_PLACEHOLDER_TEXT)
                .addClass('ghost-node')
                .appendTo(this.$rootDiv);
        }
    };

    this.restoreSelection = function (storedSelection) {
        var windowSelection = window.getSelection();
        windowSelection.removeAllRanges();

        for (var i = 0; i < storedSelection.rangeCount; i++) {
            windowSelection.addRange(storedSelection.getRangeAt(i));
        }
    };

    this.caretGetPos = function () {
        var element = this.$rootDiv[0];
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;

        if (typeof win.getSelection != "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ((sel = doc.selection) && sel.type != "Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }

        return caretOffset;
    };

    this.caretGetNode = function () {
        var node = document.getSelection().anchorNode;

        if (node == null) {
            return $(null);
        }

        return $(node.nodeType == 3 ? node.parentNode : node);
    };

    /**
     * Tries to set caret position within a $targetNode.
     *
     * @param $targetNode jQuery element node to set position within
     * @param position Caret position index to set to
     * @returns {boolean}
     */
    this.caretSetPos = function ($targetNode, position) {
        if (!$targetNode || $targetNode.length == 0) {
            console.warn('Midway Editor: caretSetPos() failed, invalid target node');
            return false;
        }

        var sel = window.getSelection();

        if (position == 0) {
            var range = document.createRange();

            range.setStart($targetNode[0], 0);
            range.collapse(true);

            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            sel.collapse($targetNode[0], position);
        }

        return true;
    };

    // Let's get this show on the road!
    this.begin();
};