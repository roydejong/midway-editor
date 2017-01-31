# midway-editor

**A WYSIWYG Editor: Simple and lightweight. Inspired by Medium's brilliant post editor.**

<center>

![](http://i.imgur.com/8AyrPT4.png)

**[View demo page](https://roydejong.github.io/midway-editor/)**

</center>

(For the record: this little project just for fun and learning. There are probably [better](https://github.com/yabwe/medium-editor) alternatives out there :grin:. This has only been tested on Chrome so far.)

## What it does

It turns an element on your page onto a fully featured post editor.

#### Current features

- Suitable for new post creation, or making an existing post editable. 
- Enforces post semantics with an `<h1>` title above the body.
- Features a basic text formatting toolbar which opens after selecting text (bold, italics, headings, blockquote).
- Link insertion and removal via the toolbar.

:ok_hand: An up-to-date list of features being worked in is available in the [Issue tracker](https://github.com/roydejong/midway-editor/issues).

## Setup

#### Prerequisites
Midway Editor uses jQuery, so be sure to include it in your page if you haven't already.
    
    <script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>

#### Install Midway

First, download a ZIP of **[the latest version](https://github.com/roydejong/midway-editor/archive/master.zip)** of this repository. You'll find production ready files in the included `dist` directory.

To use Midway, you need to include the library as well as some required CSS:

    <link rel="stylesheet" href="lib/midway-toolbar.css">
    <script src="dist/midway-editor.min.js"></script>
    
#### Enabling the editor

Check out the demo page (`index.html`) for an example.

Here's a very basic example of how the editor can be enabled:

    <div class="midway-edit">
        <h1>My post title</h1>
        <p>My post content</p>
    </div>

    <script>
        $(document).ready(function () {
            Midway.edit('.midway-edit');
        });
    </script>
    
## Development

#### Prerequisites

This project uses Grunt to bundle and minify the JavaScript source code into the distributable files. To install Grunt:

1. [Install Node.js](https://nodejs.org/en/download/) on your OS.
2. Install the Grunt CLI: `npm install -g grunt-cli`.
3. From the project directory, install the npm dependencies: `npm install`.

You'll also need Sass if you want to compile the SCSS file. To install Sass:

1. [Install Ruby](https://www.ruby-lang.org/en/documentation/installation/) runtime on your OS.
2. Install the Sass gem: `gem install sass`

#### Compiling the project

From the project directory, run `grunt` to bundle and minify the JavaScript into the `dist` directory.

To generate the `*.css` files, run `scss --update scss:dist/css`.

To ease development, set up a file watcher in your IDE of choice to automate these tasks.

