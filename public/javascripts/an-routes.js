'use strict';

var loverApp = angular.module('loverApp', [
  'ngRoute',
  'loverControllers',
]);
 
loverApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'an-partials/idx.html',
        controller: 'loverIndexCtrl'
      }).
      when('/main', {
        templateUrl: 'an-partials/main.html',
        controller: 'loverMsgCtrl'
      }).
      when('/login', {
        templateUrl: 'an-partials/login.html',
        controller: 'loverLoginCtrl'
      }).
      when('/register', {
        templateUrl: 'an-partials/register.html',
        controller: 'loverRegisterCtrl'
      }).
      otherwise({
        templateUrl: 'an-partials/error.html',
      });
  }]);