(function () {
  'use strict';
  angular.module('doc.features')
  .controller('GeneradorCtrl', ['$scope', '$uibModal', '$window',
    'i18nService', 'uiGridConstants',
    function ($scope, $uibModal, $window, i18nService, uiGridConstants) {
      $scope.generador = {
        metodo: '',
        a: 0,
        c: 0,
        m: 0,
        semilla: 0,
        d: 0,
        n: 0
      };

      $scope.generar = function () {
      };
    }]);
})();
