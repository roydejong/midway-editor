/**
 * The context text formatting toolbar, which is activated via text selection.
 */
var MidwayToolbar = {
    $toolbar: null,

    $buttonsContainer: null,

    $linkInputContainer: null,
    $linkInputField: null,
    $linkInputCloseBtn: null,

    /**
     * Tracks whether the toolbar should currently be visible or not.
     *
     * @var bool
     */
    isVisible: false,

    /**
     * Tracks whether prepareOnPage() was called previously.
     *
     * @var bool
     */
    existsInDom: false,

    /**
     * @var MidwayToolbarButton[]
     */
    availableButtons: {},

    /**
     * Tracks the text selection context, on which the toolbar operates.
     *
     * @default null
     * @var MidwayStoredSelection|null
     */
    selectionContext: null,

    /**
     * Registers a button to the toolbar globally, making it available to all editors.
     * This function can be called at any time.
     *
     * Buttons are registered by their unique ID (e.g. "bold", or "link").
     * If an ID is re-used, the existing button will be overriden.
     *
     * @param button MidwayToolbarButton
     * @public
     */
    registerButton: function (button) {
        if (button instanceof MidwayToolbarButton) {
            this.availableButtons[button.id] = button;
        } else {
            console.warn('Midway Editor: You must pass an instance of MidwayToolbarButton to registerButton()');
        }
    },

    /**
     * Internal function that bootstraps the the toolbar and adds it to the DOM.
     *
     * @private
     */
    prepareOnPage: function () {
        if (this.existsInDom) {
            return;
        }

        this.existsInDom = true;
        this.isVisible = false;

        this.$toolbar = $('' +
            '<div class="midway-toolbar virgin-toolbar">' +
                '<div class="inner">' +
                    '<div class="buttons"></div>' +
                    '<div class="link-input">' +
                        '<input class="link-field" placeholder="Paste or type a link...">' +
                        '<a class="link-cancel-btn"><i class="fa fa-times"></i></a>' +
                    '</div>' +
                    '<div class="arrow-container">' +
                        '<div class="arrow"></div>' +
                    '</div>' +
                '</div>' +
            '</div>');

        this.$toolbar.appendTo($('body'));

        this.$toolbar.on('mousedown', '*', function (e) {
            // Prevent mousedown event to avoid "clicking through" the toolbar
            e.preventDefault();
            return false;
        });

        this.$buttonsContainer = this.$toolbar.find('.buttons');

        this.$linkInputContainer = this.$toolbar.find('.link-input');
        this.$linkInputField = this.$linkInputContainer.find('input');
        this.$linkInputCloseBtn = this.$linkInputContainer.find('.link-cancel-btn');

        this.$toolbar.click(function (e) {
            e.preventDefault();
            return false;
        });
    },

    /**
     * Internal function that configures or updates the toolbar context.
     * This affects which buttons are visible, and which text selection is being tracked.
     *
     * This function should only be called when the context actually changes, for performance reasons.
     *
     * @param midwayEditor The editor instance opening the toolbar.
     * @param documentSelection Selection The text Selection that triggered the toolbar.
     * @private
     */
    setToolbarContext: function (midwayEditor, documentSelection) {
        // TODO Based on editor instance passed, apply its unique button config
        // TODO Seriously reduce how often this is called through better event handling

        // Register the text selection context
        if (documentSelection.type != "Range") {
            console.error('Midway Toolbar: setToolbarContext() failed, invalid text selection data:' + documentSelection.type);
            return;
        }

        this.selectionContext = new MidwayStoredSelection(documentSelection);

        // Rebuild buttons (while in test mode, just add all registered buttons, proper config framework is needed later)
        this.$buttonsContainer.html('');

        var buttonsConfig = midwayEditor.options.buttons;
        var buttonItems = buttonsConfig.split(' ');

        for (var i = 0; i < buttonItems.length; i++) {
            var buttonId = buttonItems[i].trim();
            var button = this.availableButtons[buttonId];

            if (buttonId == '|') {
                // Separator insert
                $('<div />')
                    .addClass('separator')
                    .appendTo(this.$buttonsContainer);
                continue;
            }

            if (!button) {
                console.warn('Midway Editor: Unsupported button type', buttonId);
                continue;
            }

            var $button = $('<a />')
                .addClass('button')
                .attr('title', button.label)
                .addClass(button.style)
                .append('<i class="fa fa-' + button.icon + '"></i>');

            $button.click(function (e) {
                e.preventDefault();

                var returnValue = this.apply(midwayEditor, documentSelection);

                if (!returnValue) {
                    // The operation failed, close the toolbar
                    MidwayToolbar.hide();
                }

                return false;
            }.bind(button));

            var buttonState = button.queryState(midwayEditor, documentSelection);

            if (buttonState != 'false' && buttonState) {
                $button.addClass('active');
            }

            this.$buttonsContainer.append($button);
        }

        // (Re)register events for link creation
        var toolbar = this;

        this.$linkInputField.unbind('keypress.midway');
        this.$linkInputField.on('keypress.midway', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();

                var linkValue = toolbar.$linkInputField.val();

                // Ensure link is prefixed with http(s). We only allow full canonical URLs.
                if (linkValue.indexOf('http://') == -1 && linkValue.indexOf('https://') == -1) {
                    linkValue = 'http://' + linkValue;
                }

                toolbar.closeLinkInput();
                toolbar.hide();

                midwayEditor.restoreSelection(toolbar.selectionContext);

                document.execCommand('createLink', false, linkValue);

                return false;
            }
        });

        this.$linkInputCloseBtn.unbind('click.midway');
        this.$linkInputCloseBtn.on('click.midway', function (e) {
            e.preventDefault();
            toolbar.closeLinkInput();
            midwayEditor.restoreSelection(toolbar.selectionContext);
            return false;
        });
    },

    /**
     * Shows the Midway Toolbar.
     * This function is usually called from a Midway Editor instance when any non-empty text selection is made or changed inside the editor.
     *
     * @param midwayEditor MidwayEditor The editor instance opening the toolbar.
     * @param documentSelection Selection The text Selection that triggered the toolbar.
     * @public
     */
    show: function (midwayEditor, documentSelection) {
        if (!this.existsInDom) {
            // First run, prepare the toolbar
            MidwayToolbar.prepareOnPage();
        }

        var selectionRange = documentSelection.getRangeAt(0);
        var selectionRect = selectionRange.getBoundingClientRect();

        var toolbarWidth = this.$toolbar.outerWidth();
        var toolbarHeight = this.$toolbar.outerHeight();
        var toolbarArrowHeight = this.$toolbar.find('.arrow').outerHeight();

        var posX = selectionRect.left + ((selectionRect.width / 2) - (toolbarWidth / 2));
        var posY = selectionRect.top - toolbarHeight - (toolbarArrowHeight / 2);

        if (posX < 5) posX = 5;
        if (posY < 5) posY = 5;

        this.setToolbarContext(midwayEditor, documentSelection);

        this.$toolbar
            .css('top', posY + 'px')
            .css('left', posX + 'px')
            .addClass('active');

        this.isVisible = true;

        this.$buttonsContainer.css('visibility', 'visible');
        this.$linkInputContainer.hide();
    },

    showLinkInput: function () {
        if (!this.isVisible) {
            return;
        }

        this.$buttonsContainer.css('visibility', 'hidden');

        this.$linkInputContainer.show();
        this.$linkInputContainer.find('input').focus();

        this.$linkInputField.val('');
    },

    closeLinkInput: function () {
        if (!this.isVisible) {
            return;
        }

        this.$buttonsContainer.css('visibility', 'visible');
        this.$linkInputContainer.hide();
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