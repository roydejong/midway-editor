// Initialize default button set on script load
MidwayToolbar.registerButton(new MidwayToolbarButton('bold', 'Bold', function () {
    return document.execCommand('bold');
}, function () {
    return document.queryCommandValue('bold');
}));

MidwayToolbar.registerButton(new MidwayToolbarButton('italic', 'Italic', function () {
    return document.execCommand('italic');
}, function () {
    return document.queryCommandValue('italic');
}));

MidwayToolbar.registerButton(new MidwayToolbarButton('underline', 'Underline', function () {
    return document.execCommand('underline');
}, function () {
    return document.queryCommandValue('underline');
}));