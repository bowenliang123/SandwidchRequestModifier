/**
 * Created by bowen on 16/3/12.
 */
'use strict';

var app = angular.module('app', [
    //service
    'dataService',
    //controller
    'mainCtrl',
    //translation service
    'pascalprecht.translate',
    'ngCookies'
]);

app.config([
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