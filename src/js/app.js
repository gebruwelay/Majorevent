angular.module('MajorEvent', [
  'ngRoute',
  'mobile-angular-ui',
  'MajorEvent.controllers.Main',
])

.config(function($routeProvider) {
  $routeProvider.when('/', {templateUrl:'home.html',  reloadOnSearch: false});
  $routeProvider.when('/board', {templateUrl:'/board.html',  reloadOnSearch: false});


});