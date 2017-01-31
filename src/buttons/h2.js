var btnMidwayHeadingTwo = new MidwayToolbarButton('h2', 'Big heading');
btnMidwayHeadingTwo.icon = 'header';

btnMidwayHeadingTwo.apply = function () {
    if (btnMidwayHeadingTwo.queryState()) {
        return document.execCommand('formatBlock', false, '<p>');
    } else {
        return document.execCommand('formatBlock', false, '<h2>');
    }
};

btnMidwayHeadingTwo.queryState = function () {
    var blockValue = document.queryCommandValue('formatBlock');
    return (blockValue && blockValue.toLowerCase() == 'h2');
};

MidwayToolbar.registerButton(btnMidwayHeadingTwo);