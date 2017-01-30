// Initialize default button set on script load
MidwayToolbar.registerButton(new MidwayToolbarButton('bold', 'Bold', function () {
    return document.execCommand('bold');
}, function () {
    return document.queryCommandState('bold');
}));

MidwayToolbar.registerButton(new MidwayToolbarButton('italic', 'Italic', function () {
    return document.execCommand('italic');
}, function () {
    return document.queryCommandState('italic');
}));

MidwayToolbar.registerButton(new MidwayToolbarButton('link', 'Link', function (midway) {
    if (midway.caretGetNode().prop("nodeName") == 'A') {
        document.execCommand('unlink', false, false);
    } else {
        MidwayToolbar.showLinkInput(midway);
    }
}, function (midway) {
    return midway.caretGetNode().prop("nodeName") == 'A';
}));