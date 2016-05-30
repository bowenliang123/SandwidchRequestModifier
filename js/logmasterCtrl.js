'use strict';

angular.module('logmasterCtrl', [])
    .controller('logmasterCtrl', ['$scope', ($scope, dataService) => {
        //常量
        $scope.MAIN_SEPERATOR = '`';
        $scope.SUB_SEPERATOR = '=';


        //响应
        $scope.updateLogText = ()=> {
            $scope.logCases = parseLogText($scope.logText);
        };


        //私有函数

        function breakLines(text) {
            if (!text) {
                return [];
            }
            let lines = text.split('\n');
            let tempArr = []
            lines.forEach((line)=> {
                tempArr.push({
                    lineArr: line.split($scope.MAIN_SEPERATOR)
                })
            });
            return tempArr;
        }

        function parseLogCase(logCase) {
            //是否排序
            if ($scope.isSort) {
                logCase.lineArr.sort()
            }

            let newArr = [];
            logCase.lineArr.forEach((line)=> {
                let index = line.indexOf($scope.SUB_SEPERATOR);
                newArr.push({
                    key: line.slice(0, index),
                    value: line.slice(index + 1, line.length)
                });
            });
            return {params: newArr};

        }

        function parseLogText(text) {
            if (!text) {
                return [];
            }


            let linesArrs = breakLines(text);

            let tempArr = []
            linesArrs.forEach((logCase) => {
                tempArr.push(parseLogCase(logCase));
            });
            return tempArr;

        }

        function init() {
            $scope.isSort = true;
            $scope.updateLogText();

        }

        init();

    }]);