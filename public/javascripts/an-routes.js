'use strict';

var loverApp = angular.module('loverApp', [
  'ngRoute',
  'loverControllers',
  'loverFilters',
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
      when('/user', {
        templateUrl: 'an-partials/main.html',
        controller: 'loverMsgCtrl'
      }).
      when('/login', {
        templateUrl: 'an-partials/login.html',
        controller: 'loverLoginCtrl'
      }).
      when('/logout', {
        templateUrl: 'an-partials/idx.html',
        controller: 'loverLogoutCtrl',
      }).
      when('/signup', {
        templateUrl: 'an-partials/register.html',
        controller: 'loverRegisterCtrl'
      }).
      otherwise({
        templateUrl: 'an-partials/error.html',
      });
  }]);
