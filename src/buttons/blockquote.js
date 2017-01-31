var btnBlockquote = new MidwayToolbarButton('blockquote');
btnBlockquote.icon = 'quote-left';

btnBlockquote.apply = function () {
    if (btnBlockquote.queryState()) {
        return document.execCommand('formatBlock', false, '<p>');
    } else {
        return document.execCommand('formatBlock', false, '<blockquote>');
    }
};

btnBlockquote.queryState = function () {
    var blockValue = document.queryCommandValue('formatBlock');
    return (blockValue && blockValue.toLowerCase() == 'blockquote');
};

MidwayToolbar.registerButton(btnBlockquote);