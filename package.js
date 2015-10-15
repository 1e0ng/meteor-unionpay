Package.describe({
  name: 'lsun:unionpay',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Union pay SDK in Meteor',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.1');
  api.use('ecmascript');
  api.use('http');
  api.use('underscore');
  api.use('momentjs:moment');
  api.use('lsun:meteor-node-forge');
  api.addFiles('unionpay.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('lsun:unionpay');
  api.addFiles('unionpay-tests.js');
});
