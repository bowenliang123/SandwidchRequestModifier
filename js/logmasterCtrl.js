'use strict';

angular.module('logmasterCtrl', [])
    .controller('logmasterCtrl', ['$scope', ($scope, dataService) => {
        //常量
        $scope.MAIN_SEPERATOR = '`';
        $scope.SUB_SEPERATOR = '=';


        //响应
        $scope.updateLogText = ()=> {
            // $scope.logCases = parseLogText($scope.logText);
            $scope.logCases = [];
            parseLogText($scope.logText);
        };


        //私有函数

        let breakLines = (text)=> {
            if (!text) {
                return [];
            }

            let lines = text.split('\n');
            let tempArr = [];
            lines.forEach((line)=> {
                tempArr.push({
                    lineArr: line.split($scope.MAIN_SEPERATOR)
                })
            });
            return tempArr;
        };

        let parseLogCase = (logCase, index)=> {
            return new Promise((resolve, reject)=> {
                //是否排序
                if ($scope.isSort) {
                    logCase.lineArr.sort()
                }

                let newArr = [];
                logCase.lineArr.forEach((line)=> {
                    let index = line.indexOf($scope.SUB_SEPERATOR);
                    newArr.push({
                        rawLine: line,
                        key: (index < 0) ? line : line.slice(0, index),
                        value: (index < 0) ? '' : line.slice(index + 1, line.length)
                    });
                });
                $scope.logCases[index] = {params: newArr};

                resolve();
            })
        };

        let parseLogText = (text)=> {
            if (!text) {
                $scope.logCases = [];
            }

            let logCases = breakLines(text);
            let haha = [];
            for (let i = 0; i < logCases.length; i++) {
                haha.push(parseLogCase(logCases[i], i));
            }
            Promise.race(haha);
        };

        let init = () => {
            $scope.isSort = true;
            $scope.queryText = '';
        };

        init();

    }]);