(function () {
  'use strict';
  angular.module('doc.features')
    // Areas List
    .controller('GeneralCtrl', [
      '$scope',
      'CurrentUser',
      function ($scope, CurrentUser) {
        $scope.currentUser = CurrentUser.get();
      }]);
})();
