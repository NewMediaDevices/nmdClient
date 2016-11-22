'use strict';

// node module!
var util = require('util');

angular.module('app')
  .controller('memoryController', function($scope, $interval) {

    $scope.version = process.version;
    $scope.arch = process.arch;

    $interval(function() {
      $scope.memory = util.inspect(process.memoryUsage());
    }, 1000);
  });
