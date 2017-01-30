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

        this.$toolbar.click(function (e) {
            e.preventDefault();
            return false;
        });
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

            var buttonState = button.queryState(midway, selection);

            if (buttonState != 'false' && buttonState) {
                $button.addClass('active');
            }

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