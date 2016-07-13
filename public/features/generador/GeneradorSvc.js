(function () {
  'use strict';
  angular
    .module('doc.features')
    .factory('Generador', ['$resource', function ($resource) {
      var Generador = $resource('/Generador/:id', {id: '@id'},
        {
          query: {
            isArray: false
          },
          update: {
            method: 'PUT'
          }
        });

      return Generador;
    }]);
})();
