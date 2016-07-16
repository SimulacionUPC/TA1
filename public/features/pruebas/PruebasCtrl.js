(function () {
  'use strict';
  angular.module('doc.features')
  .controller('PruebasCtrl', ['$scope', 'Generador',
    function ($scope, Generador) {
      $scope.set = Generador.get();

      // Objeto de pruebas
      $scope.prueba = {
        metodo: null,
        significancia: 0,
        chi2: {
          n: 0,
          max: 0,
          min: 0,
          recorrido: 0,
          intervalos: 0,
          metodoIntervalo: 1,
          longIntervalo: 0,
          tempIntervalos: 0
        },
        kolsmi: {
          n: 0,
          metodoIntervalo: 1,
          longIntervalo: 0,
          tempIntervalos: 0
        },
        racha: {
          n: 0
        },
        rachamed: {
          n: 0
        }
      };

      // Indica qué tabla se debe mostrar
      $scope.mostrarTabla = 0;
      $scope.resultado = [];
      $scope.numeros = [];
      $scope.numerosOrdenados = [];

      $scope.seleccionarConjunto = function () {
        if ($scope.prueba.conjunto) {
          Generador.get({id: $scope.prueba.conjunto}, function (response) {
            $scope.numeros = response.response;
          });
        }
      };

      $scope.probar = function () {
        var i,
            row;

        switch ($scope.prueba.metodo) {
          // Realizar Prueba Chi cuadrado
          case '1':
            $scope.prueba.chi2.n = $scope.numeros.length;
            // Obtener # Intervalos según el método seleccionado
            if ($scope.prueba.chi2.metodoIntervalo == 1) {
              $scope.prueba.chi2.intervalos = Math.round(1 + 3.3 * Math.log10($scope.prueba.chi2.n));
            } else if ($scope.prueba.chi2.metodoIntervalo == 2) {
              $scope.prueba.chi2.intervalos = Math.round(Math.sqrt($scope.prueba.chi2.n));
            } else {
              $scope.prueba.chi2.intervalos = Math.round($scope.prueba.chi2.tempIntervalos);
            }

            // Realizar prueba solo si el # de Intervalos es diferente de cero
            if ($scope.prueba.chi2.intervalos) {
              // Obtener lista ordenada
              $scope.numerosOrdenados = angular.copy($scope.numeros).sort();
              $scope.prueba.chi2.max = Math.max(...$scope.numerosOrdenados);
              $scope.prueba.chi2.min = Math.min(...$scope.numerosOrdenados);
              $scope.prueba.chi2.recorrido = ($scope.prueba.chi2.max - $scope.prueba.chi2.min).toFixed(4);

              $scope.mostrarTabla = $scope.prueba.metodo;
              $scope.prueba.chi2.longIntervalo = +($scope.prueba.chi2.recorrido / $scope.prueba.chi2.intervalos);
              $scope.resultado = [];

              // Obtener valores según el número de intervalos
              for (i = 0; i < $scope.prueba.chi2.intervalos; i++) {
                row = {};

                row.i = i + 1;
                row.li = i ? $scope.resultado[i-1].ls : $scope.prueba.chi2.min;
                row.ls = row.li + $scope.prueba.chi2.longIntervalo;
                row.fo = $scope.numerosOrdenados.filter(function (n) {
                  var decimales = decimalPlaces(n);

                  return (n > row.li.toPrecision(decimales) && n <= row.ls.toPrecision(decimales));
                }).length;
                row.fe = $scope.prueba.chi2.n / $scope.prueba.chi2.intervalos;
                row.chi2 = (Math.pow(row.fo - row.fe, 2))/row.fe;

                $scope.resultado.push(row);
              }

              // Obtener suma de todos los Chi cuadrado de cada fila
              $scope.sumchi2 = $scope.resultado.reduce(function (a, b) {
                return {chi2: a.chi2 + b.chi2};
              }).chi2;

              // Obtener el valor Chi cuadrado de la tabla
              // La librería espera un valor inverso de 'alfa'
              // Por ejemplo, si alfa = 0.1, se deberá enviar 0.9
              $scope.valorCritico = jStat.chisquare.inv(1 - ($scope.prueba.significancia / 100), $scope.prueba.chi2.intervalos - 1);

              // Muestra resultado comparando la Sumatoria de Chi2 con Chi2 de la tabla
              $scope.textoResultado = 'Solución: Los números aleatorios presentados ' +
                (($scope.sumchi2 < $scope.valorCritico) ? '' : 'no ') +
                'provienen de una población uniforme estandar para un nivel de significancia del ' +
                $scope.prueba.significancia +' %';
            } else {
              alert("Ingresar número de intervalos.");
            }
            break;
          // Realizar Prueba Kolmogorov - Smirnov
          case '2':
            $scope.mostrarTabla = $scope.prueba.metodo;
            $scope.prueba.kolsmi.n = $scope.numeros.length;
            // Obtener lista ordenada
            $scope.numerosOrdenados = angular.copy($scope.numeros).sort();
            $scope.resultado = [];

            // Obtener valores según la cantidad de números aleatorios
            for (i = 0; i < $scope.prueba.kolsmi.n; i++) {
              row = {};

              row.i = i + 1;
              row.ri = $scope.numerosOrdenados[i];
              row.in = row.i / $scope.prueba.kolsmi.n;
              row.inri = row.in - row.ri;
              row.riiin = row.ri - (row.i - 1) / $scope.prueba.kolsmi.n;

              $scope.resultado.push(row);
            }

            // Obtener D+ como el valor máximo de la columna (i/N - Ri)
            $scope.dmas = Math.max(...$scope.resultado.map(function (item) {
              return item.inri;
            })).toFixed(4);

            // Obtener D- como el valor máximo de la columna (Ri - (i - 1)/n)
            $scope.dmenos = Math.max(...$scope.resultado.map(function (item) {
              return item.riiin;
            })).toFixed(4);

            // Obtener Dc como el valor máximo entre D+ y D-
            $scope.dc = Math.max($scope.dmas, $scope.dmenos);

            // Obtener D de la tabla
            $scope.valorCritico = +kolsmi.DoKolIQ($scope.prueba.kolsmi.n, $scope.prueba.significancia / 100);

            $scope.textoResultado = 'Solución: Los números aleatorios presentados ' +
              (($scope.dc < $scope.valorCritico) ? '' : 'no ') +
              'provienen de una población uniforme estandar para un nivel de significancia del ' +
              $scope.prueba.significancia +' %';
            break;
          // Realizar Prueba de rachas
          case '3':
            var previo = false,
                gaussianInstance = gaussian(0, 1);

            $scope.mostrarTabla = $scope.prueba.metodo;
            $scope.prueba.racha.rachas = 0;
            $scope.prueba.racha.n = $scope.numeros.length;
            $scope.resultado = [];

            $scope.numeros.forEach(function (item, i) {
              if (i < $scope.numeros.length -1) {
                // Guardar cada número con una bandera que indique si el número es
                // menor o mayor al número que sigue
                $scope.resultado.push({
                  numero: item,
                  bandera: +(item < $scope.numeros[i + 1])
                });
                // Para el primer elementom crear una primera racha sin necesidad de evaluar
                if (!i) {
                  $scope.prueba.racha.rachas++;
                  previo = item < $scope.numeros[i + 1];
                // Evalúa si el número es menor al siguiente y si debe o no crear una nueva racha
                } else if (item < $scope.numeros[i + 1] && !previo) {
                  $scope.prueba.racha.rachas++;
                  previo = true;
                // Evalúa si el número es mayor al siguiente y si debe o no crear una nueva racha
                } else if (item > $scope.numeros[i + 1] && !!previo) {
                  $scope.prueba.racha.rachas++;
                  previo = false;
                }
              } else {
                // Guardar el último número sin bandera
                $scope.resultado.push({
                  numero: item,
                  bandera: "-"
                });
              }
            });

            $scope.uco = (2 * $scope.prueba.racha.n - 1) / 3;
            $scope.s2co = (16 * $scope.prueba.racha.n - 19) / 90;
            $scope.zo = ($scope.prueba.racha.rachas - $scope.uco) / Math.sqrt($scope.s2co);

            // Calcular valor de Normal de la tabla
            $scope.z = gaussianInstance.ppf(1 - ($scope.prueba.significancia / 100) / 2);
            $scope.textoResultado = 'Solución: Los números aleatorios presentados ' +
              (($scope.zo <= $scope.z && $scope.zo >= -$scope.z) ? '' : 'no ') +
              'provienen de una población aleatoria estandar para un nivel de significancia del ' +
              $scope.prueba.significancia +' %';
            break;
          // Realizar Prueba de rachas sobre y bajo la media
          case '4':
            var previo = false,
                gaussianInstance = gaussian(0, 1);

            $scope.mostrarTabla = $scope.prueba.metodo;
            $scope.prueba.rachamed.n0 = 0;
            $scope.prueba.rachamed.n1 = 0;
            $scope.prueba.rachamed.rachas = 0;
            $scope.prueba.rachamed.n = $scope.numeros.length;
            $scope.resultado = [];

            $scope.numeros.forEach(function (item, i) {
              $scope.resultado.push({
                numero: item,
                bandera: +(item <= 0.5)
              });
              if (!i) {
                previo = item <= 0.5;
                $scope.prueba.rachamed.rachas++;
                if (previo) {
                  $scope.prueba.rachamed.n1++;
                } else {
                  $scope.prueba.rachamed.n0++;
                }
              } else if (item <= 0.5) {
                $scope.prueba.rachamed.n1++;
                if (!previo) {
                  previo = true;
                  $scope.prueba.rachamed.rachas++;
                }
              } else if (item > 0.5) {
                $scope.prueba.rachamed.n0++;
                if (!!previo){
                  previo = false;
                  $scope.prueba.rachamed.rachas++;
                }
              }
            });

            $scope.uco = ((2 * $scope.prueba.rachamed.n0 * $scope.prueba.rachamed.n1) /
              $scope.prueba.rachamed.n)+0.5;
            $scope.s2co = ((2 * $scope.prueba.rachamed.n0 * $scope.prueba.rachamed.n1) *
              (2 * $scope.prueba.rachamed.n0 * $scope.prueba.rachamed.n1 - $scope.prueba.rachamed.n)) /
              (Math.pow($scope.prueba.rachamed.n, 2) * ($scope.prueba.rachamed.n - 1));
            $scope.zo = ($scope.prueba.rachamed.rachas - $scope.uco) / $scope.s2co;

            // Calcular valor de Normal de la tabla
            $scope.z = gaussianInstance.ppf(1 - ($scope.prueba.significancia / 100) / 2);
            $scope.textoResultado = 'Solución: Los números aleatorios presentados ' +
              (($scope.zo <= $scope.z && $scope.zo >= -$scope.z) ? '' : 'no ') +
              'provienen de una población aleatoria estandar para un nivel de significancia del ' +
              $scope.prueba.significancia +' %';
            break;
          }
      };

      // Obtener la cantidad decimales de un número
      function decimalPlaces(num) {
        var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) { return 0; }
        return Math.max(
            0,
           // Number of digits right of decimal point.
           (match[1] ? match[1].length : 0)
           // Adjust for scientific notation.
           - (match[2] ? +match[2] : 0));
      }

    }]);
})();
