(function () {
  'use strict';
  angular.module('doc.features')
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'features/generador/index.html',
          controller: 'GeneradorCtrl'
        })
        .when('/pruebas', {
          templateUrl: 'features/pruebas/pruebas.html',
          controller: 'PruebasCtrl'
        });
    }]);
})();
