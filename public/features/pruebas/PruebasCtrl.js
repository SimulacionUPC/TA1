(function () {
  'use strict';
  angular.module('doc.features')
  .controller('PruebasCtrl', ['$scope', '$uibModal', '$window',
    'i18nService', 'uiGridConstants', 'Generador',
    function ($scope, $uibModal, $window, i18nService, uiGridConstants, Generador) {
      angular.noop(uiGridConstants);
      $scope.set = Generador.get();

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

      $scope.seleccionarMetodo = function () {
        if ($scope.prueba.metodo) {
          switch ($scope.prueba.metodo) {
            case '1':
              $scope.prueba.chi2.max = Math.max(...$scope.numeros);
              $scope.prueba.chi2.min = Math.min(...$scope.numeros);
              $scope.prueba.chi2.recorrido = $scope.prueba.chi2.max - $scope.prueba.chi2.min;
              break;
          }
        }
      }

      $scope.probar = function () {
        var i,
            row;

        switch ($scope.prueba.metodo) {
          case '1':
            $scope.prueba.chi2.n = $scope.numeros.length;
            if ($scope.prueba.chi2.metodoIntervalo == 1) {
              $scope.prueba.chi2.intervalos = Math.round(1 + 3.3 * Math.log10($scope.prueba.chi2.n));
            } else if ($scope.prueba.chi2.metodoIntervalo == 2) {
              $scope.prueba.chi2.intervalos = Math.round(Math.sqrt($scope.prueba.chi2.n));
            } else {
              $scope.prueba.chi2.intervalos = Math.round($scope.prueba.chi2.tempIntervalos);
            }

            if ($scope.prueba.chi2.intervalos) {
              $scope.prueba.chi2.longIntervalo = $scope.prueba.chi2.recorrido / $scope.prueba.chi2.intervalos;
              $scope.numerosOrdenados = $scope.numeros.sort();
              $scope.resultado = [];

              for (i = 0; i < $scope.prueba.chi2.intervalos; i++) {
                row = {};

                row.i = i + 1;
                row.li = i ? $scope.resultado[i-1].ls : $scope.prueba.chi2.min;
                row.ls = row.li + $scope.prueba.chi2.longIntervalo;
                row.fo = $scope.numerosOrdenados.filter(function (n) {
                  return (n >= row.li && n <= row.ls);
                }).length;
                row.fe = $scope.prueba.chi2.n / $scope.prueba.chi2.intervalos;
                row.chi2 = (Math.pow(row.fo - row.fe, 2))/row.fe;

                $scope.resultado.push(row);
              }

              $scope.sumchi2 = $scope.resultado.reduce(function (a, b) {
                return {chi2: a.chi2 + b.chi2};
              }).chi2;

              $scope.valorCritico = jStat.chisquare.inv((1 - $scope.prueba.significancia / 100), $scope.prueba.chi2.n - 1);

              $scope.textoResultado = 'Solución: Los números aleatorios presentados ' +
                (($scope.sumchi2 < $scope.valorCritico) ? '' : 'no ') +
                'provienen de una población uniforme estandar para un nivel de significancia del ' +
                $scope.prueba.significancia +' %';
            }
            break;
          case '2':
            $scope.prueba.kolsmi.n = $scope.numeros.length;
            $scope.numerosOrdenados = $scope.numeros.sort();
            $scope.resultado = [];

            for (i = 0; i < $scope.prueba.kolsmi.n; i++) {
              row = {};

              row.i = i + 1;
              row.ri = $scope.numerosOrdenados[i];
              row.in = row.i / $scope.prueba.kolsmi.n;
              row.inri = row.in - row.ri;
              row.riiin = row.ri - (row.i - 1) / $scope.prueba.kolsmi.n;

              $scope.resultado.push(row);
            }

            $scope.dmas = Math.max(...$scope.resultado.map(function (item) {
              return item.inri;
            }));
            $scope.dmenos = Math.max(...$scope.resultado.map(function (item) {
              return item.riiin;
            }));
            $scope.dc = Math.max($scope.dmas, $scope.dmenos);
            $scope.valorCritico = kolsmi.DoKolIQ($scope.prueba.kolsmi.n, $scope.prueba.significancia / 100);

            $scope.textoResultado = 'Solución: Los números aleatorios presentados ' +
              (($scope.dc < $scope.valorCritico) ? '' : 'no ') +
              'provienen de una población uniforme estandar para un nivel de significancia del ' +
              $scope.prueba.significancia +' %';
            break;
          case '3':
            var previo = false,
                gaussianInstance = gaussian(0, 1);

            $scope.prueba.racha.rachas = 0;
            $scope.prueba.racha.n = $scope.numeros.length;
            $scope.resultado = [];

            $scope.numeros.forEach(function (item, i) {
              if (i < $scope.numeros.length -1) {
                $scope.resultado.push({
                  numero: item,
                  bandera: +(item < $scope.numeros[i + 1])
                });
                if (!i) {
                  $scope.prueba.racha.rachas++;
                  previo = item < $scope.numeros[i + 1];
                } else if (item < $scope.numeros[i + 1] && !previo) {
                  $scope.prueba.racha.rachas++;
                  previo = true;
                } else if (item > $scope.numeros[i + 1] && !!previo) {
                  $scope.prueba.racha.rachas++;
                  previo = false;
                }
              }
            });

            // TODO: CONSULTAR SI S 2 O 12
            $scope.uco = ((2 * $scope.prueba.racha.n - 1) / 3).toFixed(4);
            $scope.s2co = ((16 * $scope.prueba.racha.n - 19) / 90).toFixed(4);
            // TODO: CONSULTAR SI ES / RAIZ(s2co) o / s2co
            $scope.zo = (($scope.prueba.racha.rachas - $scope.uco) / Math.sqrt($scope.s2co)).toFixed(2);
            $scope.z = (gaussianInstance.ppf(1 - ($scope.prueba.significancia / 100) / 2)).toFixed(2);
            $scope.textoResultado = 'Solución: Los números aleatorios presentados ' +
              (($scope.zo <= $scope.z && $scope.zo >= -$scope.z) ? '' : 'no ') +
              'provienen de una población aleatoria estandar para un nivel de significancia del ' +
              $scope.prueba.significancia +' %';
            break;
          case '4':
            var previo = false,
                gaussianInstance = gaussian(0, 1);

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

            $scope.uco = (((2 * $scope.prueba.rachamed.n0 * $scope.prueba.rachamed.n1) /
              $scope.prueba.rachamed.n)+0.5).toFixed(4);
            $scope.s2co = (((2 * $scope.prueba.rachamed.n0 * $scope.prueba.rachamed.n1) *
              (2 * $scope.prueba.rachamed.n0 * $scope.prueba.rachamed.n1 - $scope.prueba.rachamed.n)) /
              (Math.pow($scope.prueba.rachamed.n, 2) * ($scope.prueba.rachamed.n - 1))).toFixed(4);
            $scope.zo = (($scope.prueba.rachamed.rachas - $scope.uco) / $scope.s2co).toFixed(2);
            $scope.z = (gaussianInstance.ppf(1 - ($scope.prueba.significancia / 100) / 2)).toFixed(2);
            $scope.textoResultado = 'Solución: Los números aleatorios presentados ' +
              (($scope.zo <= $scope.z && $scope.zo >= -$scope.z) ? '' : 'no ') +
              'provienen de una población aleatoria estandar para un nivel de significancia del ' +
              $scope.prueba.significancia +' %';
            break;
          }
      };

    }]);
})();
