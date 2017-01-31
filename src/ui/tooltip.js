/**
 * Helper for showing tooltips in Midway Editor.
 */
var MidwayTooltip = {
    /**
     * Registers a tooltip on a $parent node with a given selector.
     *
     * @param $parent {jQuery} The jQuery selector for the parent node (e.g. the editor div istelf).
     * @param selector {string} The selector to register tooltips for (e.g. ".has-tooltip").
     */
    register: function ($parent, selector) {
        $parent.off('mouseenter.midway');
        $parent.on('mouseenter.midway', selector, function () {
            MidwayTooltip.showTooltip($(this));
        });

        $parent.off('mouseleave.midway');
        $parent.on('mouseleave.midway', selector, function (e) {
            var $toElement = $(e.toElement);
            var $relatedTarget = $(e.relatedTarget);

            if ($toElement.closest('.midway-tooltip').length || $relatedTarget.closest('.midway-tooltip').length) {
                e.preventDefault();
                return false;
            }

            MidwayTooltip.killTooltip($(this));
        });
    },

    /**
     * Given the node we are creating a tooltip $for, extracts the correct tooltip text to use.
     * In order of preference, tries the following attributes: title, alt, and finally href.
     *
     * @param $for {jQuery}
     * @returns {string|null}
     */
    getTooltipText: function ($for) {
        var title = $for.attr('title');
        if (title) {
            return title;
        }

        var alt = $for.attr('alt');
        if (alt) {
            return alt;
        }

        var href = $for.attr('href');
        if (href) {
            return href;
        }

        return null;
    },

    /**
     * Shows a tooltip $for a specific node.
     * Calling this function also removes any old tooltips.
     *
     * @param $for {jQuery}
     * @returns {boolean}
     */
    showTooltip: function ($for) {
        this.killAllTooltips();

        var text = this.getTooltipText($for);
        
        if (!text) {
            return false;
        }

        var $tooltip = $('<div />')
            .addClass('midway-tooltip');

        var $tooltipInner = $('<div />')
            .addClass('inner')
            .appendTo($tooltip);

        if ($for.attr('href')) {
            var $tooltipLink = $('<a />')
                .text(text)
                .attr('href', $for.attr('href'))
                .attr('target', '_blank')
                .appendTo($tooltipInner);
        } else {
            $tooltipInner.text(text);
        }

        $tooltip.append('<div class="arrow-container"><div class="arrow"></div></div>');

        $for.data('tooltip', $tooltip);
        $('body').append($tooltip);

        $tooltip.mouseenter(function (e) {
            e.preventDefault();
            return false;
        });
        $tooltip.mouseleave(function (e) {
            e.preventDefault();
            MidwayTooltip.killAllTooltips();
            return false;
        });

        var tooltipWidth = $tooltip.outerWidth();

        var rect = $for[0].getBoundingClientRect();
        var posX = rect.left + ((rect.width / 2) - (tooltipWidth / 2));
        var posY = rect.bottom;

        $tooltip
            .css('top', posY + 'px')
            .css('left', posX + 'px');

        return true;
    },

    /**
     * Removes a tooltip off the screen, given the node it was shown $for.
     *
     * @param $for {jQuery}
     */
    killTooltip: function ($for) {
        var tooltipDomRef = $for.data('tooltip');

        if (tooltipDomRef) {
            $(tooltipDomRef).remove();
        }
    },

    /**
     * Removes all Midway editor tooltips from the screen.
     */
    killAllTooltips: function () {
        $('.midway-tooltip').remove();
    }
};