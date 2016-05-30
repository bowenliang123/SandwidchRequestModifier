'use strict';

var logmaster_app = angular.module('logmaster_app', [
    //service
    //controller
    'logmasterCtrl'
]);

logmaster_app.config([
    '$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|chrome|data):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);