
(function () {
  'use strict';

  // ========== initialize main module ========== //
  angular
    .module('documentarioApp', [
      'ngAnimate',
      'ngCookies',
      'ngResource',
      'ngRoute',
      'ngSanitize',
      'doc.features',
      'ui.bootstrap'
    ]);
  angular.module('doc.features', []);
  angular.module('documentarioApp')
  /**
   * Decorate $resource so we can add in common functionality.
   */
    .config(['$provide', function ($provide) {
      $provide.decorator('$resource', ['$delegate',
        function ($delegate) {
          /**
           * Angular tries to extend the top level default action configuration with resource verb objcts.
           * https://github.com/angular/angular.js/blob/master/src/ngResource/resource.js#L548
           * Since "extend" doesn't perform a deep merge, verb object ends up overriding the configuration.
           * In order to overcome it, we will be extending each verb with its default configuration.
           */

          var defaults = {
                get: {method: 'GET'},
                query: {method: 'GET'},
                save: {method: 'POST'},
                remove: {method: 'DELETE'},
                delete: {method: 'DELETE'},
                update: {method: 'PATCH'}
              },
              decorator = function (url, paramDefaults, verbs) {
                angular.forEach(verbs, function (verb, verbName) {
                  /**
                   * Extend each verb with its default configuration
                   * If the default configuration for the verb is not defined, don't do anything
                   */
                  if (defaults[verbName] && !verb.hasOwnProperty('method')) {
                    angular.extend(verb, defaults[verbName]);
                  }
                  /**
                   * Each model and verb can specify their own error handler.
                   * Default to orca.genericErrorHandler if not specified.
                   */
                  verb.interceptor = verb.interceptor || {};
                });

                return $delegate(url, paramDefaults, verbs);
              };

          return decorator;
        }]);
    }]);

})();
