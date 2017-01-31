var btnMidwayBold = new MidwayToolbarButton('bold', 'Bold');

btnMidwayBold.apply = function () {
    return document.execCommand('bold');
};

btnMidwayBold.queryState = function () {
    return document.queryCommandState('bold');
};

MidwayToolbar.registerButton(btnMidwayBold);