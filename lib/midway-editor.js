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

var MidwayToolbar = {
    $toolbar: null,
    $buttonsContainer: null,

    isVisible: false,
    existsInDom: false,

    availableButtons: [],

    registerButton: function (button) {
        if (button instanceof MidwayToolbarButton) {
            this.availableButtons.push(button);
        } else {
            console.warn('Midway Editor: You must pass an instance of MidwayToolbarButton to registerButton()');
        }
    },

    prepareOnPage: function () {
        if (this.existsInDom) {
            return;
        }

        this.existsInDom = true;
        this.isVisible = false;

        this.$toolbar = $('' +
            '<div class="midway-toolbar virgin-toolbar">' +
                '<div class="toolbar-inner">' +
                    '<div class="buttons">' +
                    '</div>' +
                '</div>' +
                '<div class="arrow-container">' +
                    '<div class="arrow"></div>' +
                '</div>' +
            '</div>');

        this.$toolbar.appendTo($('body'));
        this.$buttonsContainer = this.$toolbar.find('.buttons');
    },

    configureButtons: function (midway, selection) {
        // TODO Based on editor instance passed, apply its unique button config
        this.$buttonsContainer.html('');

        for (var i = 0; i < this.availableButtons.length; i++) {
            var button = this.availableButtons[i];

            var $button = $('<a />')
                .addClass('button')
                .attr('title', button.label)
                .append('<i class="fa fa-' + button.id + '"></i>');

            $button.click(function () {
                this.apply(midway, selection);
            }.bind(button));

            this.$buttonsContainer.append($button);
        }
    },

    show: function (midway, selection) {
        var selectionRange = selection.getRangeAt(0);
        var selectionRect = selectionRange.getBoundingClientRect();

        var toolbarWidth = this.$toolbar.outerWidth();
        var toolbarHeight = this.$toolbar.outerHeight();
        var toolbarArrowHeight = this.$toolbar.find('.arrow').outerHeight();

        var posX = selectionRect.left + ((selectionRect.width / 2) - (toolbarWidth / 2));
        var posY = selectionRect.top - toolbarHeight - (toolbarArrowHeight / 2);

        if (posX < 5) posX = 5;
        if (posY < 5) posY = 5;

        this.configureButtons(midway, selection);

        this.$toolbar
            .css('top', posY + 'px')
            .css('left', posX + 'px')
            .addClass('active');

        this.isVisible = true;
    },

    hide: function () {
        if (!this.isVisible) {
            return;
        }

        this.$toolbar
            .removeClass('active')
            .removeClass('virgin-toolbar');

        this.isVisible = true;
    }
};

/**
 * A reusable instance of a toolbar button.
 * @constructor
 */
var MidwayToolbarButton = function (id, label, applyFunction) {
    this.id = id;
    this.label = "Button";

    if (label) {
        this.label = label;
    }

    this.apply = function (midway, selection) {
        console.warn('Midway Editor: You must implement MidwayToolbarButton.apply()');
    };

    if (applyFunction) {
        this.apply = applyFunction;
    }
};

/**
 * Midway Editor instance.
 *
 * @constructor
 */
var MidwayEditor = function ($rootDiv) {
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
                    if (midway.$lastUserNode.hasClass('post-heading')) {
                        // We are pressing return in a post heading, block browser behavior and skip to the next <p> node
                        e.preventDefault();

                        var $firstP = midway.$lastUserNode.parent().find('p').first();
                        midway.caretSetPos($firstP, 0);

                        return false;
                    } else if (midway.$lastUserNode.hasClass('post-paragraph') && midway.$lastUserNode.hasClass('ghost-node')) {
                        // We are pressing return in the first paragraph and there's no page content yet
                        // Ignore it, we don't want node inseration here
                        e.preventDefault();
                        return false;
                    }
                }
            } else if ((e.keyCode == 8 || e.keyCode == 46) && midway.$lastUserNode && midway.$lastUserNode.hasClass('ghost-node')) {
                // We are pressing backspace or delete on an empty ghost node
                // Ignore it, we don't want unexpected behavior here
                e.preventDefault();
                return false;
            } else if (midway.keyCodeIsInput(e.keyCode)) {
                // Only fire beforeInput event if the key pressed actually seems to be input
                midway.beforeInput();
            }

            midway.checkCaret();
        });

        this.$rootDiv.on('input.midway', function () {
            midway.$nextUserNode = null;
            midway.contentChanging();
            midway.checkCaret();
        });

        this.$rootDiv.on('keyup.midway', function () {
            midway.$nextUserNode = null;
            midway.checkCaret();
        });
    };

    this.keyCodeIsInput = function (keyCode) {
        return ((keyCode >= 48 && keyCode <= 90) || (keyCode >= 186));
    };

    this.contentChanging = function () {
        if (this.$lastUserNode) {
            var $lastNode = this.$lastUserNode;
            var lastNode = $lastNode[0];
            var lastNodeHtml = $lastNode.html();

            if ((noZwHtml = lastNodeHtml.replace(/\u200B/g, '')) != lastNodeHtml) {
                // kill remaining zero width chars at this point but maintain caret position
                // (this is part of the hack to make placeholders work)
                $lastNode.html(noZwHtml);
                this.caretSetPos($lastNode, $lastNode.text().length);
            }

            if ($lastNode.text().trim().length == 0 && $lastNode.hasClass('post-heading')) {
                $lastNode
                    .text('Title')
                    .addClass('post-heading')
                    .addClass('ghost-node')
                    .removeClass('was-a-ghost');
            }
        }
    };

    this.beforeInput = function () {
        var $caretNode = this.caretGetNode();

        if ($caretNode.hasClass('ghost-node')) {
            $caretNode
                .html('&#8203;') // zero width character to prevent the node from collapsing in height
                .removeClass('ghost-node')
                .addClass('was-a-ghost');

            this.caretSetPos($caretNode, 0);
        }
    };

    this.checkCaret = function () {
        var $caretNode = this.$nextUserNode ? this.$nextUserNode : this.caretGetNode();

        if ($caretNode.hasClass('ghost-node')) {
            // This is a "ghost node" (a placeholder), so behave like a placeholder and keep the caret at pos-zero
            this.caretSetPos($caretNode, 0);
        }

        this.checkPlaceholders();

        // Run the selection code async to prevent weird timing issues with window.getSelection()
        window.setTimeout(function () {
            this.checkSelection($caretNode);
        }.bind(this), 0);

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

        var makeNodeIntoTitlePlaceholder = function ($node) {
            $node
                .text('Title')
                .addClass('post-heading')
                .addClass('ghost-node')
                .removeClass('was-a-ghost');
        };

        if (!$firstChild || $firstChild.prop("nodeName") != "H1") {
            this.$titleNode = $('<h1 />')
                .prependTo(this.$rootDiv);

            makeNodeIntoTitlePlaceholder(this.$titleNode);
        } else {
            this.$titleNode = $firstChild;
        }

        // Check that at least one <p> child exists to begin containing body text, create if needed
        var $anyPs = this.$rootDiv.find('p');
        var $anyNonEmptyPs = this.$rootDiv.find('p').not(':empty');

        if ($anyNonEmptyPs.length == 0) {
            //
            this.$rootDiv.find('p').remove();

            $('<p />')
                .text('Tell your story...')
                .addClass('post-paragraph')
                .addClass('ghost-node')
                .appendTo(this.$rootDiv);
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

        var el = this.$rootDiv;
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart($targetNode[0], position);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
    };

    // Let's get this show on the road!
    this.begin();
};

// Initialize default button set on script load
MidwayToolbar.registerButton(new MidwayToolbarButton('bold', 'Bold', function () {
    document.execCommand('bold');
}));
MidwayToolbar.registerButton(new MidwayToolbarButton('italic', 'Italic', function () {
    document.execCommand('italic');
}));
MidwayToolbar.registerButton(new MidwayToolbarButton('underline', 'Underline', function () {
    document.execCommand('underline');
}));
