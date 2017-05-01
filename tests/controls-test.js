// To run the tests:
// $ npm install phantomjs -g
// $ npm install casperjs -g
// $ cd tests
// $ casperjs test *

var fs          = require('fs');
var system      = require('system');
var currentFile = fs.absolute(system.args[system.args.length - 1]);
var currentPath = currentFile.split('/').slice(0,-1).join('/');

casper.test.begin('Can control videos', 8, function suite(test) {
  casper.start('file://' + currentPath + '/../index.html', function() {
    casper.waitForSelector('.screen iframe', function() {
      test.assertExists('.playlist div:nth-child(1).selected');
      casper.click('.next');
      test.assertExists('.playlist div:nth-child(2).selected');
      casper.click('.prev');
      test.assertExists('.playlist div:nth-child(1).selected');
      casper.click('.next');
      test.assertExists('.playlist div:nth-child(2).selected');
      casper.click('.next');
      test.assertExists('.playlist div:nth-child(3).selected');
      casper.click('.next');
      test.assertExists('.playlist div:nth-child(4).selected');
      casper.click('.next');
      test.assertExists('.playlist div:nth-child(1).selected');
      casper.click('.prev');
      test.assertExists('.playlist div:nth-child(4).selected');
    });
  });

  casper.run(function() {
    test.done();
  });
});
