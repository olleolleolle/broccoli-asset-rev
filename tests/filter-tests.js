var fs       = require('fs');
var path     = require('path');
var assert   = require('assert');
var walkSync = require('walk-sync');
var broccoli = require('broccoli');
var mergeTrees = require('broccoli-merge-trees');

var assetRev  = require('../lib/asset-rev');

var builder;

function confirmOutput(actualPath, expectedPath) {
  var actualFiles = walkSync(actualPath);
  var expectedFiles = walkSync(expectedPath);

  assert.deepEqual(actualFiles, expectedFiles, 'files output should be the same as those input');

  expectedFiles.forEach(function(relativePath) {
    if (relativePath.slice(-1) === '/') { return; }

    var actual   = fs.readFileSync(path.join(actualPath, relativePath), { encoding: 'utf8'});
    var expected = fs.readFileSync(path.join(expectedPath, relativePath), { encoding: 'utf8' });

    assert.equal(actual, expected, relativePath + ': does not match expected output');
  });
}

describe('broccoli-asset-rev', function() {
  afterEach(function() {
    if (builder) {
      builder.cleanup();
    }
  });

  it('revs the assets and rewrites the source', function(){
    var sourcePath = 'tests/fixtures/basic';

    var tree = assetRev(sourcePath + '/input', {
      extensions: ['js', 'css', 'png', 'jpg', 'gif'],
      replaceExtensions: ['html', 'js', 'css']
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });

  it('revs the assets when it is not the first plugin', function () {
    var sourcePath = 'tests/fixtures/basic';

    var merged = mergeTrees([sourcePath + '/input']);

    var tree = assetRev(merged, {
      extensions: ['js', 'css', 'png', 'jpg', 'gif'],
      replaceExtensions: ['html', 'js', 'css']
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(graph) {
      confirmOutput(graph.directory, sourcePath + '/output');
    });
  });
});
