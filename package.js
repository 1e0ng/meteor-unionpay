Package.describe({
  name: 'lsun:unionpay',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'Union pay SDK in Meteor',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/liangsun/meteor-unionpay',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.0.1');
  api.use('ecmascript');
  api.use('http');
  api.use('underscore');
  api.use('momentjs:moment@2.10.6');
  api.use('lsun:meteor-node-forge@0.6.35_5');
  api.addFiles('unionpay.js', ['server']);
  api.export('UnionPay');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('momentjs:moment');
  api.use('lsun:unionpay');
  api.addFiles('test/unionpay-tests.js');
});
