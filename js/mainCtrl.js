/**
 * Created by bowen on 16/3/12.
 */
'use strict';

angular.module('mainCtrl', [])
    .controller('mainCtrl', ['$scope', 'dataService', ($scope, dataService) => {

        /**
         * 初始化
         */
        (function init() {

            $scope.cases = [];
            $scope.showCase = undefined;
            $scope.activeCase = undefined;
            $scope.headerDescriptors = '[]';
            //$scope.headerDescriptors = angular.toJson(demoHeaderDescriptors, true);

            $scope.headersInfo = [];
            //$scope.headersInfo = [
            //    {
            //        headerName: 'ucpara',
            //        headerDescription: 'UC公参',
            //        subFields: [
            //            {
            //                fieldName: 'sn',
            //                fieldValue: '123456789',
            //                fieldDescription: 'sn 就是一个 sn'
            //            }
            //        ]
            //    }
            //];

            $scope.extensionVersion = chrome.app.getDetails().version;  //chrome 扩展版本

            getHeaderDescriptors();

            getAllCases();

            getActiveCase();

            addInputLIstener();
            $('#uaTextarea').elastic();
            $('#headersTextarea').elastic();
            $('#getparamsTextarea').elastic();

        })();

        function getAllCases() {
            //getAllCases
            chrome.extension.sendRequest({action: "getAllCases"}, (response) => {
                let cases = response.cases;
                if (cases && cases.length > 0) {
                    $scope.cases = cases;

                    if (!$scope.showCase) {
                        $scope.changeShowCase($scope.cases[0]);
                    }

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
                $scope.changeShowCase(activeCase);

                //force refresh
                $scope.$apply();

            });
        }

        /**
         * 触发下载二维码文件
         * @param base64img
         */
        function invokeDownload(content) {
            //初始化链接
            let downloadLink = document.createElement("a");

            //用 base64 生成 url
            downloadLink.href = 'data:text/plain,' + content;

            //文件名
            downloadLink.download = 'sailfish-export-' + new Date().getTime() + '.json';

            //加入到文档中
            document.body.appendChild(downloadLink);

            //下载
            downloadLink.click();

            //清理节点
            document.body.removeChild(downloadLink);
        }


        function getHeaderDescriptors() {
            let callback = (item)=> {
                if (!item) {
                    $scope.headerDescriptors = '[]';
                    return;
                }
                $scope.headerDescriptors = item;
            };

            chrome.storage.sync.get('headerDescriptors', (items) => {
                if (items['headerDescriptors']) {
                    callback && callback(items['headerDescriptors']);
                }
            });
        }

        $scope.getHeaderDescriptors = getHeaderDescriptors;

        $scope.saveHeaderDescriptors = ()=> {
            try {
                let hd = angular.fromJson($scope.headerDescriptors);
                chrome.storage.sync.set({'headerDescriptors': $scope.headerDescriptors}, () => {
                    console.log('saveHeaderDescriptors finished.');
                });
            } catch (e) {
                alert('Failed to parse headerDescriptors (should be in JSON format).');
            }
        };

        function parseHeaders(headersStr, headerDescriptors) {
            if (!headersStr || headersStr == ''
                || !headerDescriptors || headerDescriptors == []) {
                return [];
            }

            //拆解 header 行
            let headersInfo = [];
            let headerLines = headersStr.split('\n');
            headerLines.forEach((headerLine)=> {

                    //拆解 header 行
                    let index = headerLine.indexOf(':');
                    if (index <= 0 || index == headerLine.length - 1) {
                        return;
                    }
                    let headerKey = headerLine.slice(0, index);
                    let headerValue = headerLine.slice(index + 1, headerLine.length);

                    //找到匹配的 header 描述器
                    let targetDescriptors = headerDescriptors.filter((descriptor)=> (descriptor.headerName == headerKey));

                    //未找到对应的 header 描述器
                    if (!targetDescriptors || targetDescriptors.length < 1) {
                        return;
                    }


                    //找到对应的 header 描述
                    let targetHeaderDescriptor = targetDescriptors[0];

                    let headerInfo = {
                        headerName: headerKey,
                        headerValue: headerValue,
                        headerDescription: targetHeaderDescriptor.headerDescription
                    };


                    //若当前header描述器包含子字段分割字符
                    let separator = targetHeaderDescriptor.subFieldsSeparator;
                    let subFields = targetHeaderDescriptor.subFields;
                    if (!separator || !subFields || subFields == []) {
                        headersInfo.push(headerInfo);
                        return;
                    }


                    headerInfo.subFields = [];

                    let subFieldsArr = headerValue.split(separator);
                    let parsedSubFieldsArr = [];

                    //拆解 header 行中子字段并组装
                    if (subFieldsArr && subFieldsArr != []) {

                        subFieldsArr.forEach((subFieldStr)=> {
                            if (!subFieldStr || subFieldStr == '') {
                                return;
                            }

                            //拆解子字段键值对
                            let index = subFieldStr.indexOf('=');
                            if (index < 0) {
                                return;
                            }
                            let subFieldKey = subFieldStr.slice(0, index);
                            let subFieldValue = subFieldStr.slice(index + 1, subFieldStr.length);

                            parsedSubFieldsArr.push({fieldName: subFieldKey, fieldValue: subFieldValue});
                        });
                    }

                    //匹配并添加子字段描述
                    parsedSubFieldsArr.forEach((subField)=> {
                        subField.fieldDescription = subFields[subField.fieldName];

                        headerInfo.subFields.push(subField);
                    });

                    //排序子字段描述
                    headerInfo.subFields.sort((headerInfo1, headerInfo2)=> {
                        if (headerInfo1.fieldName == headerInfo2.fieldName) {
                            return 0;
                        } else if (headerInfo1.fieldName > headerInfo2.fieldName) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });

                    headersInfo.push(headerInfo);
                }
            );


            return headersInfo;
        }


//响应JSON上传input 元素点击事件
        function addInputLIstener() {
            $('#uploadInput').change((e) => {
                console.log(e);
                let filePath = $('#uploadInput')[0].files[0];
                let reader = new FileReader();

                if (filePath) {
                    //响应事件 -  文件读取完成
                    reader.addEventListener("load", ()=> {
                        let fileContent = reader.result;
                        //parse json and update cases
                        $scope.cases = JSON.parse(fileContent);

                        //persist data
                        $scope.persistAllCases($scope.cases);

                        //deactivate all cases
                        $scope.deactivateCase();

                        //force refresh
                        $scope.$apply();
                    }, false);


                    //读取文件文本内容
                    reader.readAsText(filePath);
                }
            });
        }

        /**
         * 导入所有用例
         */
        $scope.importCases = ()=> {
            $('#uploadInput')[0].click();
        };

        /**
         * 导出所有用例
         */
        $scope.exportCases = ()=> {
            invokeDownload(angular.toJson($scope.cases));
        };

        /**
         * 更换展示用例
         * @param simCase
         */
        $scope.changeShowCase = (simCase)=> {
            $scope.showCase = simCase;
            $scope.updateUaInfo();
            $scope.updateHeadersInfo();
        };

        /**
         * 激活用例
         * @param simCase
         */
        $scope.activateCase = (simCase) => {
            //update local
            $scope.activeCase = simCase;

            //update remote
            chrome.extension.sendRequest({action: "activateCase", caseStr: angular.toJson(simCase)}, (response) => {
            })
        };

        /**
         * 停止生效
         */
        $scope.deactivateCase = ()=> {
            //update local
            $scope.activeCase = undefined;

            //update remote
            chrome.extension.sendRequest({action: "deactivateCase"}, (response) => {
            })
        };

        /**
         * 删除用例
         * @param simCaseId
         */
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
            $scope.persistAllCases($scope.cases);

            //若删除的当前用例为激活用例，取消激活状态
            if ($scope.activeCase && simCaseId == $scope.activeCase.caseId) {
                $scope.deactivateCase();
            }
        };

        /**
         * 保存当前用例
         * @param simCaseId
         */
        $scope.saveCase = (simCaseId)=> {
            if (!simCaseId) {
                alert('当前用例为空');
                return;
            }

            if (!$scope.cases) {
                return;
            }

            let targetCase = $scope.cases.find((item)=>(item.caseId == simCaseId));
            if (!targetCase) {
                alert('未找到要保存的用例');
                return;
            }

            //更新并持久化用例
            targetCase = $scope.showCase;
            $scope.persistAllCases($scope.cases);

            //若保存的当前用例为激活用例，重新激活一次
            if ($scope.activeCase && simCaseId == $scope.activeCase.caseId) {
                $scope.activateCase(targetCase);
            }

            alert('保存成功');
        };

        /**
         * 新建用例
         */
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
            $scope.persistAllCases($scope.cases);
        };


        /**
         * 解析并更新 UA 信息
         */
        $scope.updateUaInfo = () => {
            let uaStr = $scope.showCase.ua;

            let uaParser = new UAParser();
            uaParser.setUA(uaStr);

            $scope.uaInfo = uaParser.getResult();
        };

        /**
         * 持久化所有用例数据到后台
         */
        $scope.persistAllCases = (simCases) => {
            chrome.extension.sendRequest({
                action: "saveAllCases",
                casesStr: angular.toJson(simCases)  //序列化
            }, (response) => {
            });
        };

        /**
         * 更新 header 信息
         */
        $scope.updateHeadersInfo = ()=> {

            try {
                let headersInfo = parseHeaders($scope.showCase.headers, angular.fromJson($scope.headerDescriptors));

                $scope.headersInfo = headersInfo;
            } catch (e) {
                console.error('Failed to parse headerDescriptors (should be in JSON format).');
            }
        };
    }])
;