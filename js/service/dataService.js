/**
 * Created by bowen on 16/4/4.
 */
'use strict';

angular.module('dataService', [])
    .factory('dataService', ()=> {
        let exports = {};


        return {
            hello: ()=> {
                alert('hello');
            }
        };

    });