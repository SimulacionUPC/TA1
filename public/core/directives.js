(function () {
  'use strict';
  angular
  .module('doc.features')
  .directive('datePicker', function () {
    return {
      restrict : 'A',
      link : function (scope, element) {
        $(function () {
          // Define spanish texts
          $.fn.datepicker.dates.es = {
            days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            daysShort: ['Dom', 'Lum', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
            daysMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
            months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul',
              'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
            today: 'Hoy',
            clear: 'Borrar',
            format: 'dd/mm/yyyy',
            titleFormat: 'MM yyyy', /* Leverages same syntax as 'format' */
            weekStart: 0
          };
          $(element).datepicker({
            language: 'es',
            autoclose: true,
            clearBtn: true,
            todayHighlight: true
          });
        });
      }
    };
  })
  .directive('sidebarMenu', function () {
    return {
      restrict: 'E',
      templateUrl: 'core/templates/sidebarMenu.html',
      controller: [function () {
      }]
    };
  });
})();
