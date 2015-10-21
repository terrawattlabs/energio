'use strict';

angular
  .module('snapwattApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'ui.bootstrap',
    'angular-growl',
    'ui.select',
    'chart.js'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/alphatest', {
        templateUrl: 'views/alphatest.html',
        controller: 'AlphaCtrl'
      })
      .when('/setup', {
        templateUrl: 'views/setup.html',
        controller: 'SetupCtrl'
      })
      .when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashCtrl'
      })
      .when('/location/:objID', {
        templateUrl: 'views/location.html',
        controller: 'locationCtrl'
      })
      .when('/test', {
        templateUrl: 'views/test.html',
        controller: 'testCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
