var btnMidwayHeadingThree = new MidwayToolbarButton('h3', 'Small heading');
btnMidwayHeadingThree.icon = 'header';
btnMidwayHeadingThree.style = 'smaller';

btnMidwayHeadingThree.apply = function () {
    if (btnMidwayHeadingThree.queryState()) {
        return document.execCommand('formatBlock', false, '<p>');
    } else {
        return document.execCommand('formatBlock', false, '<h3>');
    }
};

btnMidwayHeadingThree.queryState = function () {
    var blockValue = document.queryCommandValue('formatBlock');
    return (blockValue && blockValue.toLowerCase() == 'h3');
};

MidwayToolbar.registerButton(btnMidwayHeadingThree);