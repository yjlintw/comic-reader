# Comic Reader
An Electron app's for manga/comic reading.
![build](https://travis-ci.org/yjlintw/comic-reader.svg?branch=master)

## Features
1. Search comic books inside the app
2. Add comics into favorite list
3. Read each episode in a single scrolling page
4. Desktop Notification when subscribed comics has new update **[still testing]**
4. Automatically adjust the size of each image to the height of app window
5. Keyboard navigation (Left/Right change images; Up/Down change chapters)
6. Read history
7. Translation between Traditional Chinese and Simplified Chinese

## Supported Host 
1. SF互動傳媒網 [www.sfacg.com](http://www.sfacg.com)
2. 8Comic [8comic.se](http://8comic.se/)
3. dm5 [www.dm5.com](http://www.dm5.com/)
2. ...more coming

## Known Issues
1. Mobile View is broken at this moment.

## Remove Settings
### Only for users who have used the app with version number smaller than v0.1.5
Please remove the settings file at

Mac:
```bash
~/Library/Application\ Support/comic-reader/Settings
```
Windows:
```bash
%APPDATA%/<Your App>
```
Linux:
```bash
$XDG_CONFIG_HOME/<Your App>
```
or
```bash 
~/.config/<Your App>
```

## Screen Shots
### Search View
![Imgur](http://i.imgur.com/HfHSH2A.png)
### Favorite View
![Imgur](http://i.imgur.com/zV3ECFq.png)
### Read View
![Imgur](http://i.imgur.com/N5P9HLY.jpg)


# For Developers:
First install all the dependencies by using the following line

```
npm install
```

To execute the code use:
```
npm run dev
```
It will do automatically sass watching and compiling when there is a change made
to the sass files. It also run a livereloadx server. Once any of the file under 
the project folder is changed, it will automatically refresh the app.

More detailed documentation is here:
[Wiki](https://github.com/yjlintw/comic-reader/wiki/App-Architecture)



## TODO::
1. Define behavior in mobile view
2. Revamp UI
3. Different view mode (original size, fit screen-width)

