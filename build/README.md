# RobotCraftingTableServer
a node js application running from an index.js starting point

## installing
go to a terminal window, find the build folder and type (sudo) npm install to install all of the dependencies.
after that you can just type "node index" to run the server from the build folder
if you would just like to run the HTML files, those should be executable on their own, specifically the instruct folder.  these can all be found in the "/build/public" folder.

## running
if you are running the server, all content within the public folder can be accessed via localhost:8080
ie:
* XCarve Admin - http://localhost:8080/admin
* Display - http://localhost:8080/display
* Instruct (Blockly) - 3 different URLs for the 3 different iPads:
http://localhost:8080/instruct/?myID=1
http://localhost:8080/instruct/?myID=2
http://localhost:8080/instruct/?myID=3

## display page
the display javascript code under "build/public/display/js/interface.js" has a sample tied to the socket server that will cause the content of a div to update.  This can be tested by opening the display page in one window and the admin in another.  Type something in the "Send Message" area and click the link, it will be updated in the display window for the duration specific.

## instruct page
the instruct javascript has been slightly reformatted to match the formatting of the rest of the application.  It also contains an updated sample of sending instructions via socket.io to the server.

## admin (xcarve)
this page allows for testing commands and overriding if needed

## standards
[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
Code is written trying to follow the JS Standard (http://standardjs.com/) in order to maintain editability and compatibility with libraries and multiple developers.
