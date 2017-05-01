// To run the tests:
// $ npm install phantomjs -g
// $ npm install casperjs -g
// $ cd tests
// $ casperjs test *

var fs          = require('fs');
var system      = require('system');
var currentFile = fs.absolute(system.args[system.args.length - 1]);
var currentPath = currentFile.split('/').slice(0,-1).join('/');

casper.test.begin('Can load playlist', 4, function suite(test) {
  casper.start('file://' + currentPath + '/../index.html', function() {
    casper.waitForSelector('.thumb', function() {
      test.assertElementCount('.thumb', 4);
      test.assertElementCount('.thumb img', 4);
      test.assertElementCount('.thumb div', 4);
      test.assertElementCount('.thumb.selected', 1);
    });
  });

  casper.run(function() {
    test.done();
  });
});
