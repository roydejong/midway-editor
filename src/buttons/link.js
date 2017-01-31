var btnMidwayLink = new MidwayToolbarButton('link', 'Link');

btnMidwayLink.apply = function (midway) {
    if (btnMidwayLink.queryState(midway)) {
        document.execCommand('unlink', false, false);
    } else {
        MidwayToolbar.showLinkInput(midway);
    }
};

btnMidwayLink.queryState = function (midway) {
    return midway.caretGetNode().is('a') || midway.caretGetNode().children().has('a').length > 0;
};

MidwayToolbar.registerButton(btnMidwayLink);