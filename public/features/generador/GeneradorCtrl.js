(function () {
  'use strict';
  angular.module('doc.features')
  .controller('GeneradorCtrl', ['$scope', 'Generador',
    function ($scope, Generador) {
      var listaCongruencial = [],
          listaCuadradoMedio = [],
          recorte = function (_xi2, izq_der, d) {
            //Obteniendo como texto
            var txt = _xi2 + "",
                txt_recortado = angular.copy(txt);

            //Analizando si es de la derecha o izquierda
            if (izq_der == 1) { //Izquierda
              //Realizando el recorte comenzando por la ixquierda
              //Verificando que la longitud del valor sea igual a "d"
              var mov = 0,
                  pos_i = 0,
                  pos_d = 0;

              for (var ii = 0; ii < txt.length; ii++) {
                //Analizando la longitud actual si es igual a "d"
                if (txt_recortado.length > d) {
                  if (mov == 0) {
                    //Recortando por la izquierda
                    pos_i += 1;
                    txt_recortado = txt.substr(pos_i, txt.length - pos_d - pos_i);
                    mov = 1;
                  } else {
                    //Recortando por la derecha
                    pos_d += 1;
                    txt_recortado = txt.substr(pos_i, txt.length - pos_d - pos_i);
                    mov = 0;
                  }
                } else {
                  //Si es igual, salimos del bucle.
                  break;
                }
              }
            } else if (izq_der == 2) { //Derecha
              //Realizando el recorte comenzando por la ixquierda
              //Verificando que la longitud del valor sea igual a "d"
              var mov = 0,
                  pos_i = 0,
                  pos_d = 0;

              for (var ii = 0; ii < txt.length; ii++) {
                //Analizando la longitud actual si es igual a "d"
                if (txt_recortado.length > d) {
                  if (mov == 0) {
                    //Recortando por la derecha
                    pos_d += 1;
                    txt_recortado = txt.substr(pos_i, txt.length - pos_d);
                    mov = 1;
                  } else {
                    //Recortando por la izquierda
                    pos_i += 1;
                    txt_recortado = txt.substr(pos_i, txt.length - pos_d);
                    mov = 0;
                  }
                } else {
                  //Si es igual, salimos del bucle.
                  break;
                }
              }
            }

            return txt_recortado;
          };

      $scope.generador = {
        metodo: '',
        a: 0,
        c: 0,
        m: 0,
        xo: 0,
        d: 0,
        n: 0,
        eliminar: '1',
        nombre: ''
      };

      $scope.result = [];

      $scope.generar = function () {
        $scope.generador.nombre = '';

        if ($scope.generador.n && $scope.generador.d && $scope.generador.d <= 20) {
          if ($scope.generador.metodo === '1' &&
              $scope.generador.a &&
              $scope.generador.c &&
              $scope.generador.m &&
              $scope.generador.xo &&
              $scope.generador.d) {
            $scope.ejecutarCongruencial()
            $scope.result = listaCongruencial;
          } else if ($scope.generador.metodo === '2' &&
              $scope.generador.xo &&
              $scope.generador.d) {
            $scope.ejecutarCuadradoMedio();
            $scope.result = listaCuadradoMedio;
          }
        }
      };

      $scope.ejecutarCuadradoMedio = function () {
        //Tomando el primer número
        listaCuadradoMedio = [];
        var _row_ini = {},
            pow = Math.pow(10, $scope.generador.d);

        //Generando los números aleatorios
        var _i = 0;

        while (listaCuadradoMedio.length < $scope.generador.n) {
          var _row = {};

          var _i_aux = _i,
              _xi_aux = _i ? listaCuadradoMedio[_i-1].xi2medio : $scope.generador.xo,
              _xi2_aux = _xi_aux * _xi_aux,
              _xi2medio_aux = 0; //calcular recortando la izquierda y la derecha

          _xi2medio_aux = parseInt(recorte(_xi2_aux, $scope.generador.eliminar, $scope.generador.d), 0) || 0;

          var _d_xi2medio_aux = _xi2medio_aux,
              _ri_aux = (_d_xi2medio_aux / pow);

            _row.i = _i_aux;
            _row.xi = _xi_aux;
            _row.xi2 = _xi2_aux;
            _row.xi2medio = _xi2medio_aux;
            _row.ri = _ri_aux;
            listaCuadradoMedio.push(_row);

            _i += 1;
        }
      };

      $scope.ejecutarCongruencial = function () {
        //Tomando el primer número
        listaCongruencial = [];
        var _row_ini = {};

        //Generando los números aleatorios
        var _i = 0,
            _xo = $scope.generador.xo,
            _axoc = ($scope.generador.a * _xo) + $scope.generador.c,
            _axocm = _axoc % $scope.generador.m,
            _d_axocm = _axocm,
            _axocmm = parseFloat((_d_axocm / $scope.generador.m) + "");

        _row_ini.i = (_i);
        _row_ini.xo = (_xo);
        _row_ini.axoc = (_axoc);
        _row_ini.axocm = (_axocm);
        _row_ini.axocmm = (_axocmm).toFixed($scope.generador.d);
        listaCongruencial.push(_row_ini);

        while (listaCongruencial.length < $scope.generador.n) {
          var _row = {};

          _i += 1;
          var _i_aux = _i,
              _xo_aux = _axocm,
              _axoc_aux = ($scope.generador.a * _xo_aux) + $scope.generador.c,
              _axocm_aux = _axoc_aux % $scope.generador.m,
              _d_axocm_aux = _axocm_aux,
              _axocmm_aux = parseFloat((_d_axocm_aux / $scope.generador.m) + "");

          //Guardando la nueva variable aleatoria
          _row.i = (_i_aux);
          _row.xo = (_xo_aux);
          _row.axoc = (_axoc_aux);
          _row.axocm = (_axocm_aux);
          _row.axocmm = (_axocmm_aux).toFixed($scope.generador.d);
          listaCongruencial.push(_row);

          //Configurando los valores
          _i = _i_aux;
          _xo = _xo_aux;
          _axoc = _axoc_aux;
          _axocm = _axocm_aux;
          _axocmm = _axocmm_aux;
        }
      };

      $scope.guardar = function () {
        if ($scope.generador.nombre) {
          $scope.set = Generador.get();
          $scope.set.nombre = $scope.generador.nombre;
          $scope.set.numeros = $scope.result.map(function (a) {
            return ($scope.generador.metodo == 1) ? a.axocmm : a.ri;
          });
          $scope.set.$save(function () {
            console.log("HOLA");
          });
        }
      };
    }]);
})();
