/**
 * Created by bowen on 16/4/8.
 */
'use strict';

var app = angular.module('popupApp', [
    //service
    //'dataService',
    //controller
    'popupCtrl',
    'pascalprecht.translate',
    'ngCookies'
]);


app.config([
  '$translateProvider',
    function ($translateProvider) {
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


angular.module('popupCtrl', [])
    .controller('popupCtrl', ['$scope', ($scope) => {
        $scope.text = 'haha';

        //初始化
        (function init() {
            //获取所有模拟用例
            getAllCases();

            //获取激活的用例
            getActiveCase();
        })();

        function getAllCases() {
            //getAllCases
            chrome.extension.sendRequest({action: "getAllCases"}, (response) => {
                let cases = response.cases;
                if (cases && cases.length > 0) {
                    $scope.cases = cases;

                    //force refresh
                    $scope.$apply();
                }
            });
        }

        //getActiveCase
        function getActiveCase() {

            chrome.extension.sendRequest({action: "getActiveCase"}, (response) => {
                let activeCase = response.activeCase;
                if (!activeCase) {
                    $scope.activeCase = undefined;
                    return;
                }

                $scope.activeCase = activeCase;

                //force refresh
                $scope.$apply();
            });
        }

        //close popup
        function closePopup() {
            window.close();
        }

        $scope.createNewTabToMain = ()=> {
            chrome.tabs.create({'url': chrome.extension.getURL('html/main.html')}, function (tab) {
            });

            closePopup();
        };

         $scope.createNewTabToLOG = ()=> {
                    chrome.tabs.create({'url': chrome.extension.getURL('html/logmaster.html')}, function (tab) {
                    });

                    closePopup();
                };

        $scope.activateCase = (simCase)=> {
            //update remote
            chrome.extension.sendRequest({action: "activateCase", caseStr: angular.toJson(simCase)}, (response) => {
            });

            closePopup();
        };

        $scope.deactivateCase = ()=> {
            //update remote
            chrome.extension.sendRequest({action: "deactivateCase"}, (response) => {
            });

            closePopup();
        };
    }]);