// To run the tests:
// $ npm install phantomjs -g
// $ npm install casperjs -g
// $ cd tests
// $ casperjs test *

var fs          = require('fs');
var system      = require('system');
var currentFile = fs.absolute(system.args[system.args.length - 1]);
var currentPath = currentFile.split('/').slice(0,-1).join('/');

casper.test.begin('Has expected elements', 9, function suite(test) {
  casper.start('file://' + currentPath + '/../index.html', function() {
    test.assertTitle('Playday - Stewart Lord');
    test.assertExists('.title');
    test.assertExists('.desc');
    test.assertExists('.prev');
    test.assertExists('.next');
    test.assertExists('.error');
    test.assertExists('.screen');
    test.assertExists('.playlist');
    test.assertExists('.what');
  });

  casper.run(function() {
    test.done();
  });
});
