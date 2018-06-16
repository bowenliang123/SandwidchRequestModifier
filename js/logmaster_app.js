'use strict';

var logmaster_app = angular.module('logmaster_app', [
    //service
    //controller
    'logmasterCtrl',
    'pascalprecht.translate',
    'ngCookies'
]);

logmaster_app.config([
    '$compileProvider','$translateProvider',
    function ($compileProvider, $translateProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|chrome|data):/);
    // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)

    // configures staticFilesLoader
       $translateProvider.useStaticFilesLoader({
         prefix: '/locales/locale-',
         suffix: '.json'
       });
       // load 'en' table on startup
       $translateProvider.preferredLanguage('en');
       $translateProvider.useSanitizeValueStrategy('escape');
       $translateProvider.useLocalStorage();
    }
]);