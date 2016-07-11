(function () {
  'use strict';
  angular
    .module('doc.features')
  /**
   * Show notification using angular strap
   */
    .factory('notification', function ($alert) {
      return {
        // @todo : it sounds cool :D but seriously it would be better XD
        great: function (message) {
          $alert({
            title: message,
            placement: 'top',
            type: 'success',
            show: true,
            container: '.message',
            duration: '8',
            animation: 'am-fade-and-slide-top'
          });
        },
        warn: function (message) {
          $alert({
            title: message,
            placement: 'top',
            type: 'warning',
            show: true,
            container: '.message',
            duration: '8',
            animation: 'am-fade-and-slide-top'
          });
        },
        error : function (message) {
          $alert({
            title: message,
            placement: 'top',
            type: 'danger',
            show: true,
            container: '.message',
            duration: '8',
            animation: 'am-fade-and-slide-top'
          });
        },
        genericErrorHandler: function (response) {
          $alert({
            title: response.message || 'Opps algo paso, Por favor refresque la pagina.',
            placement: 'top',
            type: 'danger',
            show: true,
            container: '.message',
            duration: '8',
            animation: 'am-fade-and-slide-top'
          });
        }
      };
    });
})();
