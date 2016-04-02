/**
 * Created by bowen on 16/3/12.
 */
'use strict';

angular.module('mainCtrl', [])
    .controller('mainCtrl', ($scope) => {


        //初始化
        init();

        /**
         * 初始化
         */
        function init() {

            $scope.cases = [];
            $scope.showCase = undefined;
            $scope.activeCase = undefined;

            //getAllCases
            chrome.extension.sendRequest({action: "getAllCases"}, (response) => {
                console.log(response);
                var cases = response.cases;
                if (cases && cases.length > 0) {
                    $scope.cases = cases;

                    if (!$scope.showCase) {
                        $scope.showCase = $scope.cases[0];
                    }

                    //force refresh
                    $scope.$apply();
                }
            });

            //getActiveCase
            chrome.extension.sendRequest({action: "getActiveCase"}, (response) => {
                console.log(response);
                let activeCase = response.activeCase;
                if (!activeCase) {
                    $scope.activeCase = undefined;
                    return;
                }

                $scope.activeCase = activeCase;
                $scope.showCase = activeCase;

                //force refresh
                $scope.$apply();

            });
        }

        $scope.changeCaseId = (simCase)=> {
            $scope.showCase = simCase;
        };

        $scope.activateCase = (simCase) => {
            //update local
            $scope.activeCase = simCase;

            //update remote
            chrome.extension.sendRequest({action: "activateCase", caseStr: angular.toJson(simCase)}, (response) => {
            })
        };

        $scope.deActivateCase = ()=> {
            //update local
            $scope.activeCase = undefined;

            //update remote
            chrome.extension.sendRequest({action: "deactivateCase"}, (response) => {
            })
        };

        $scope.removeCase = (simCaseId)=> {
            if (!simCaseId) {
                return;
            }
            if (!$scope.cases) {
                return;
            }

            $scope.cases = $scope.cases.reduce((pre, next)=> {
                if (next.caseId != simCaseId) {
                    pre.push(next);
                }
                return pre;
            }, []);

            //持久化所有用例
            persistAllCases($scope.cases);
        };

        $scope.saveCase = (simCaseId)=> {
            if (!$scope.cases) {
                return;
            }
            let targetCase = $scope.cases.filter((item)=>(item.caseId == simCaseId));
            if (!targetCase) {
                return;
            }

            targetCase = $scope.showCase;

            //持久化所有用例
            persistAllCases($scope.cases);
        };

        $scope.createNewCase = () => {
            var newCaseName = prompt('输入新建case名称', '');
            if (!newCaseName) {
                alert('呃…名称不能为空啊');
                return;
            }
            console.log(newCaseName);
            $scope.cases.push({
                caseId: new Date().getTime(),
                name: newCaseName
            });

            //持久化所有用例
            persistAllCases($scope.cases);
        }
    })
;

//持久化所有用例数据到后台
function persistAllCases(simCases) {
    chrome.extension.sendRequest({
        action: "saveAllCases",
        casesStr: angular.toJson(simCases)  //序列化
    }, (response) => {
    });
}