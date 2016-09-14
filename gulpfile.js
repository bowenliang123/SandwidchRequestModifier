'use strict';

// Load plugins
const gulp = require('gulp');
const clean = require('gulp-clean');
const zip = require('gulp-zip');
const babel = require("gulp-babel");
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');


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

        //bootstrap
        'bower_components/bootstrap/dist/**/*',

        //font-awesome
        'bower_components/font-awesome/css/**/*',
        'bower_components/font-awesome/fonts/**/*',

        //jquery
        'bower_components/jquery/dist/**/*',

        //ua-parser-js
        'bower_components/ua-parser-js/dist/**/*',

        //jquery-elastic
        'bower_components/jquery-elastic/jquery.elastic.source.js',
    ], {'base': '.'})
        .pipe(gulp.dest('dist/'));
});

// 复制必要的文件
gulp.task('copyNpm', ['clean'], ()=> {
    return gulp.src([
        //
        //'node_modules//**/*',

    ], {'base': '.'})
        .pipe(gulp.dest('dist/'));
});

// 复制必要的文件
gulp.task('copy', ['clean', 'copyBower'], ()=> {
    return gulp.src([
        'manifest.json',
        'html/*',
        'css/*',
        // 'js/**/*',
        //'bower_components/**/',
        'img/*'
    ], {'base': '.'})
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
gulp.task('zip', ['build'], ()=> {
    return gulp.src('dist/**/*', {'base': '.'})
        .pipe(zip('SandwidchRequester-' + getYYYYMMDDHHMM() + '.zip'))
        .pipe(gulp.dest('releases'));
});

// babeljs
gulp.task('babeljs', ['clean', 'copy'], ()=> {
    return gulp.src("js/**/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("dist/js"));
});

// Build
gulp.task('build', ['clean', 'copy', 'babeljs']);

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
        'bower.json',
        'package.json',
        //'bower_components/**/*',
        //'node_modules/',
    ], ['build']);
});