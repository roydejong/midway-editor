var btnMidwayItalic = new MidwayToolbarButton('italic');

btnMidwayItalic.apply = function () {
    return document.execCommand('italic');
};

btnMidwayItalic.queryState = function () {
    return document.queryCommandState('italic');
};

MidwayToolbar.registerButton(btnMidwayItalic);