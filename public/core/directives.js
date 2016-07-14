(function () {
  'use strict';
  angular
  .module('doc.features')
  .directive('sidebarMenu', function () {
    return {
      restrict: 'E',
      templateUrl: 'core/templates/sidebarMenu.html',
      controller: [function () {
      }]
    };
  });
})();
