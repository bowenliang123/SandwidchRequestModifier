'use strict';

// Load plugins
const gulp = require('gulp'),
    clean = require('gulp-clean'),
    zip = require('gulp-zip');

let getYYYYMMDDHHMM = () => {
    let toXX = (input) => ((input < 10) ? ('0' + input) : input);

    let date = new Date();
    return `${date.getFullYear()}${toXX(date.getMonth() + 1)}${toXX(date.getDate())}${toXX(date.getHours())}${toXX(date.getMinutes())}`;
};

// 复制必要的文件
gulp.task('copyBower', ['clean'], ()=> {
    return gulp.src([
            //angular
            'bower_components/angular/angular.min.js',

            //boostrap
            'bower_components/bootstrap/dist/**/*',

            //font-awesome
            'bower_components/font-awesome/css/**/*',
            'bower_components/font-awesome/fonts/**/*',

            //jquery
            'bower_components/jquery/dist/**/*',

            //qrcode.js
            'bower_components/qrcode.js/qrcode.js',
        ], {"base": "."})
        .pipe(gulp.dest('dist/'));
});

// 复制必要的文件
gulp.task('copy', ['clean', 'copyBower'], ()=> {
    return gulp.src([
            'manifest.json',
            'html/*',
            'js/**/*',
            'css/*',
            //'bower_components/**/',
            'img/*'
        ], {"base": "."})
        .pipe(gulp.dest('dist/'));
});


// Clean
gulp.task('clean', () => {
    return gulp.src([
            'dist/',
            'releases/'
        ], {read: false})
        .pipe(clean());
});

// zip
gulp.task('zip', ['clean', 'copy'], ()=> {
    return gulp.src('dist/**/*', {"base": "."})
        .pipe(zip('quico-' + getYYYYMMDDHHMM() + '.zip'))
        .pipe(gulp.dest('releases'));
});


// Build
gulp.task('build', ['clean', 'copy', 'zip']);

// Default
gulp.task('default', ['watch']);

// Watch
gulp.task('watch', ['build'], () => {
    gulp.watch([
        //项目依赖单个文件
        'manifest.json',
        'gulpfile.js',

        //应用逻辑
        'css/**/*',
        'html/**/*',
        'img/**/*',
        'js/**/*',

        //依赖库
        'bower_components/**/*',
    ], ['build']);
});