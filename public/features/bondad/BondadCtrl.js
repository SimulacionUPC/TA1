(function () {
  'use strict';
  angular.module('doc.features')
  .controller('BondadCtrl', ['$scope', 'Generador',
    function ($scope, Generador) {
      $scope.datos = {
        numeros: []
      };

      /* No modificar librería */
      var X = XLSX;
      var XW = {
          /* worker message */
          msg: 'xlsx',
          /* worker scripts */
          rABS: '../../plugins/xls/xlsxworker2.js',
          norABS: './xlsxworker1.js',
          noxfer: './xlsxworker.js'
      };

      var rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";
      if(!rABS) {
          document.getElementsByName("userabs")[0].disabled = true;
          document.getElementsByName("userabs")[0].checked = false;
      }

      var use_worker = typeof Worker !== 'undefined';
      if(!use_worker) {
          document.getElementsByName("useworker")[0].disabled = true;
          document.getElementsByName("useworker")[0].checked = false;
      }

      var transferable = use_worker;
      if(!transferable) {
          document.getElementsByName("xferable")[0].disabled = true;
          document.getElementsByName("xferable")[0].checked = false;
      }

      var wtf_mode = false;

      function fixdata(data) {
          var o = "", l = 0, w = 10240;
          for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
          o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
          return o;
      }

      function ab2str(data) {
          var o = "", l = 0, w = 10240;
          for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint16Array(data.slice(l*w,l*w+w)));
          o+=String.fromCharCode.apply(null, new Uint16Array(data.slice(l*w)));
          return o;
      }

      function s2ab(s) {
          var b = new ArrayBuffer(s.length*2), v = new Uint16Array(b);
          for (var i=0; i != s.length; ++i) v[i] = s.charCodeAt(i);
          return [v, b];
      }

      function xw_noxfer(data, cb) {
          var worker = new Worker(XW.noxfer);
          worker.onmessage = function(e) {
              switch(e.data.t) {
                  case 'ready': break;
                  case 'e': console.error(e.data.d); break;
                  case XW.msg: cb(JSON.parse(e.data.d)); break;
              }
          };
          var arr = rABS ? data : btoa(fixdata(data));
          worker.postMessage({d:arr,b:rABS});
      }

      function xw_xfer(data, cb) {
          var worker = new Worker(rABS ? XW.rABS : XW.norABS);
          worker.onmessage = function(e) {
              switch(e.data.t) {
                  case 'ready': break;
                  case 'e': console.error(e.data.d); break;
                  default:
                    var xx;
                    xx=ab2str(e.data).replace(/\n/g,"\\n").replace(/\r/g,"\\r"); console.log("done"); cb(JSON.parse(xx)); break;
              }
          };
          if(rABS) {
              var val = s2ab(data);
              worker.postMessage(val[1], [val[1]]);
          } else {
              worker.postMessage(data, [data]);
          }
      }

      function xw(data, cb) {
          transferable = document.getElementsByName("xferable")[0].checked;
          if(transferable) xw_xfer(data, cb);
          else xw_noxfer(data, cb);
      }

      function to_json(workbook) {
          var result = [];
          workbook.SheetNames.forEach(function(sheetName) {
              var roa = X.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
              if(roa.length > 0){
                  result = roa.map(function(a) {
                    return a['muestra'];
                  });
              }
          });
          return result;
      }

      var tarea = document.getElementById('b64data');
      function b64it() {
          if(typeof console !== 'undefined') console.log("onload", new Date());
          var wb = X.read(tarea.value, {type: 'base64',WTF:wtf_mode});
          process_wb(wb);
      }

      function process_wb(wb) {
        $scope.$apply(function () {
          $scope.datos.numeros = to_json(wb);
        });
      }

      var drop = document.getElementById('drop');
      function handleDrop(e) {
          e.stopPropagation();
          e.preventDefault();
          rABS = document.getElementsByName("userabs")[0].checked;
          use_worker = document.getElementsByName("useworker")[0].checked;
          var files = e.dataTransfer.files;
          var f = files[0];
          {
              var reader = new FileReader();
              var name = f.name;
              reader.onload = function(e) {
                  if(typeof console !== 'undefined') console.log("onload", new Date(), rABS, use_worker);
                  var data = e.target.result;
                  if(use_worker) {
                      xw(data, process_wb);
                  } else {
                      var wb;
                      if(rABS) {
                          wb = X.read(data, {type: 'binary'});
                      } else {
                      var arr = fixdata(data);
                          wb = X.read(btoa(arr), {type: 'base64'});
                      }
                      process_wb(wb);
                  }
              };
              if(rABS) reader.readAsBinaryString(f);
              else reader.readAsArrayBuffer(f);
          }
      }

      function handleDragover(e) {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
      }

      if(drop.addEventListener) {
          drop.addEventListener('dragenter', handleDragover, false);
          drop.addEventListener('dragover', handleDragover, false);
          drop.addEventListener('drop', handleDrop, false);
      }


      var xlf = document.getElementById('xlf');
      function handleFile(e) {
          rABS = document.getElementsByName("userabs")[0].checked;
          use_worker = document.getElementsByName("useworker")[0].checked;
          var files = e.target.files;
          var f = files[0];
          {
              var reader = new FileReader();
              var name = f.name;
              reader.onload = function(e) {
                  if(typeof console !== 'undefined') console.log("onload", new Date(), rABS, use_worker);
                  var data = e.target.result;
                  if(use_worker) {
                      xw(data, process_wb);
                  } else {
                      var wb;
                      if(rABS) {
                          wb = X.read(data, {type: 'binary'});
                      } else {
                      var arr = fixdata(data);
                          wb = X.read(btoa(arr), {type: 'base64'});
                      }
                      process_wb(wb);
                  }
              };
              if(rABS) reader.readAsBinaryString(f);
              else reader.readAsArrayBuffer(f);
          }
      }
      /* Fin de librería */

      $scope.prueba = {
        significancia: 0,
        chi2: {
          n: 0,
          max: 0,
          min: 0,
          recorrido: 0,
          intervalos: 0,
          metodoIntervalo: 1,
          longIntervalo: 0,
          tempIntervalos: 0,
          var: 0,
          std: 0,
          mean: 0
        }
      };

      $scope.probar = function () {
        var i,
            row,
            gaussianInstance = gaussian(0, 1);

        if ($scope.prueba.significancia) {
          $scope.prueba.chi2.n = $scope.datos.numeros.length;
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
            $scope.numerosOrdenados = angular.copy($scope.datos.numeros).sort();
            $scope.prueba.chi2.max = Math.max(...$scope.numerosOrdenados);
            $scope.prueba.chi2.min = Math.min(...$scope.numerosOrdenados);
            $scope.prueba.chi2.recorrido = ($scope.prueba.chi2.max - $scope.prueba.chi2.min).toFixed(4);

            $scope.mostrarTabla = true;
            $scope.prueba.chi2.longIntervalo = +($scope.prueba.chi2.recorrido / $scope.prueba.chi2.intervalos);
            $scope.resultado = [];

            $scope.prueba.chi2.var = math.var($scope.numerosOrdenados).toPrecision(4);
            $scope.prueba.chi2.std = math.std($scope.numerosOrdenados).toPrecision(4);
            $scope.prueba.chi2.mean = math.mean($scope.numerosOrdenados).toPrecision(4);

            // Obtener valores según el número de intervalos
            for (i = 0; i < $scope.prueba.chi2.intervalos; i++) {
              row = {};

              row.i = i + 1;
              row.li = i ? $scope.resultado[i-1].ls : $scope.prueba.chi2.min;
              row.ls = row.li + $scope.prueba.chi2.longIntervalo;
              row.fo = $scope.numerosOrdenados.filter(function (n, i) {
                n = +n;

                return !!i ? (n > row.li.toPrecision(4) && n <= row.ls.toPrecision(4)) :
                  (n >= row.li.toPrecision(4) && n <= row.ls.toPrecision(4));
              }).length;


              row.pi = gaussianInstance.cdf((row.ls - $scope.prueba.chi2.mean) / $scope.prueba.chi2.std) -
                gaussianInstance.cdf((row.li - $scope.prueba.chi2.mean) / $scope.prueba.chi2.std);

              row.fe = row.pi * $scope.prueba.chi2.n;
              row.chi2 = Math.pow(row.fo - row.fe, 2)/row.fe;

              $scope.resultado.push(row);
            }

            $scope.prueba.chi2.spi = 0;
            $scope.prueba.chi2.sfe = 0;
            $scope.resultado.forEach(function (item) {
              $scope.prueba.chi2.spi += item.pi;
              $scope.prueba.chi2.sfe += item.fe;
            });
            $scope.prueba.chi2.spi = $scope.prueba.chi2.spi.toPrecision(4);
            $scope.prueba.chi2.sfe = $scope.prueba.chi2.sfe.toPrecision(4);

            // Verificar si los Fe son mayores que 5, de lo contrario re agrupar
            $scope.reagrupar = $scope.resultado.filter(function (item, i) {
              item.idx = i;
              return item.fe <= 5;
            });

            if ($scope.reagrupar.length) {
              $scope.reagrupado = angular.copy($scope.resultado);
              $scope.reagrupar.reverse().forEach(function (item) {
                if (!item.idx) {

                } else {
                  $scope.reagrupado[item.idx-1].ls = item.ls;
                  $scope.reagrupado[item.idx-1].fo += item.fo;
                  $scope.reagrupado[item.idx-1].fe += item.fe;
                  $scope.reagrupado.splice(item.idx, 1);
                }
              });

              $scope.reagrupado.forEach(function (item) {
                item.chi2 = Math.pow(item.fe - item.fo, 2) / item.fe;
              });
            }

            $('#firstChart').highcharts({
              chart: {
                type: 'line'
              },
              title: {
                text: 'Gráfica'
              },
              xAxis: {
                categories: ['1', '2', '3', '4', '5', '6',
                    '7', '8', '9', '10', '11', '12']
              },
              yAxis: {
              },
              tooltip: {
                crosshairs: true,
                shared: true
              },
              plotOptions: {
                spline: {
                  marker: {
                    radius: 4,
                    lineColor: '#666666',
                    lineWidth: 1
                  }
                }
              },
              series: [{
                marker: {
                  symbol: 'square'
                },
                data: $scope.resultado.map(function(a) {return a.fo;})
              }]
            });



            /*$('#firstChart').highcharts({
              xAxis: {
                min: -0.5,
                max: 5.5
              },
              yAxis: {
                min: 0
              },
              title: {
                text: 'Scatter plot with regression line'
              },
              series: [{
                type: 'line',
                name: 'Regression Line',
                data: [[0, 1.11], [5, 4.51]],
                marker: {
                  enabled: false
                },
                states: {
                  hover: {
                    lineWidth: 0
                  }
                },
                enableMouseTracking: false
              }, {
                type: 'scatter',
                name: 'Observations',
                data: $scope.reagrupar.length ? $scope.reagrupado.map(function(a) {return a.fo;}) :
                  $scope.resultado.map(function(a) {return a.fo;}),
                marker: {
                  radius: 4
                }
              }]
            });*/

            if (!$scope.reagrupar.length) {
              // Obtener suma de todos los Chi cuadrado de cada fila
              $scope.sumchi2 = $scope.resultado.reduce(function (a, b) {
                return {chi2: a.chi2 + b.chi2};
              }).chi2;
            } else {
              // Obtener suma de todos los Chi cuadrado de cada fila
              $scope.sumchi2 = $scope.reagrupado.reduce(function (a, b) {
                return {chi2: a.chi2 + b.chi2};
              }).chi2;
            }

            // Obtener el valor Chi cuadrado de la tabla
            // La librería espera un valor inverso de 'alfa'
            // Por ejemplo, si alfa = 0.1, se deberá enviar 0.9
            $scope.valorCritico = jStat.chisquare.inv(1 - ($scope.prueba.significancia / 100),
              ($scope.reagrupado.length ? $scope.reagrupado.length : $scope.prueba.chi2.intervalos) - 1);

            // Muestra resultado comparando la Sumatoria de Chi2 con Chi2 de la tabla
            $scope.textoResultado = 'Solución: Los muestra ' +
              (($scope.sumchi2 < $scope.valorCritico) ? '' : 'no ') +
              'proviene de una población cuya distribución es la de interés para un nivel de significancia del ' +
              $scope.prueba.significancia +' %';
          } else {
            alert("Ingresar número de intervalos.");
          }
        } else {
          alert("Ingresar el porcentaje de significancia.");
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
