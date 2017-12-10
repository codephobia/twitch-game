var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var lbAngular = require('gulp-loopback-sdk-angular');
var rename = require('gulp-rename');
var path = require('path');
var del = require('del');
var nodemon = require('gulp-nodemon');

var NODE_ENV = process.env.NODE_ENV || 'development';

// paths
var paths = {
    sass:   'client/sass/**/*.scss',
    fonts:  'client/sass/fonts/**/*',
    html:   'client/views/**/*.html',
    js:     'client/js/**/*.js',
    img:    'client/img/**/*',
    vendor: 'client/vendor/',
    models: 'common/models/**/*',
    build:  'client/build/',
    dist:   'client/build/dist/'
};

// sass
gulp.task('css', function (callback) {
    return runSequence(
        ['sass:build', 'css:vendor:build'],
        ['sass:concat', 'css:vendor:concat'],
        ['fonts', 'fonts:vendor'],
        callback
    );
});

// sass - build
gulp.task('sass:build', function () {
    return gulp.src(paths.sass)
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(gulp.dest(paths.build + 'css'));    
});

// sass - concat
gulp.task('sass:concat', function () {
    return gulp.src(paths.build + 'css/*.css')
        .pipe(concat('styles.css'))
        .pipe(gulp.dest(paths.dist + 'css'));
});

// css - vendor
gulp.task('css:vendor:build', function () {
    gulp.src([
        paths.vendor + 'font-awesome/css/font-awesome.css',
        paths.vendor + 'angular-material/angular-material.css'
    ]).pipe(gulp.dest(paths.build + 'css/vendor'));
});

// css - vendor - concat
gulp.task('css:vendor:concat', function () {
    return gulp.src(paths.build + 'css/vendor/*.css')
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest(paths.dist + 'css'));
});

// sass - watch
gulp.task('sass:watch', function () {
    return gulp.watch(paths.sass, ['sass:watched']);
});

// sass - watched
gulp.task('sass:watched', function (callback) {
    return runSequence(
        'sass:build',
        'sass:concat',
        callback
    );
});

// fonts
gulp.task('fonts', function () {
    gulp.src(paths.fonts)
        .pipe(gulp.dest(paths.dist + 'fonts'));
});

// fonts - watch
gulp.task('fonts:watch', function () {
    return gulp.watch(paths.fonts, ['fonts']);
});

// fonts - vendor
gulp.task('fonts:vendor', function () {
    gulp.src([
        paths.vendor + 'font-awesome/fonts/**/*'
    ]).pipe(gulp.dest(paths.dist + 'fonts'));
});

// html
gulp.task('html', function () {
    gulp.src(paths.html)
        .pipe(gulp.dest(paths.dist + 'views'));
});

// html - watch
gulp.task('html:watch', function () {
    return gulp.watch(paths.html, ['html:watched']);
});

// html -watched
gulp.task('html:watched', function (callback) {
    return runSequence(
        'html',
        callback
    );
});

// js
gulp.task('js', function (callback) {
    return runSequence(
        ['js:app:build', 'js:vendor:build'],
        ['js:app:concat', 'js:vendor:concat'],
        callback
    );
});

// js - app - build
gulp.task('js:app:build', function () {
    return gulp.src(paths.js)
        .pipe(gulp.dest(paths.build + 'js'));
});

// js - app - concat
gulp.task('js:app:concat', function () {
    return gulp.src([
        paths.build + 'js/**/*.js',
        '!' + paths.build + 'js/vendor',
        '!' + paths.build + 'js/vendor/**'
    ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest(paths.dist + 'js'));
});

// js - app - watch
gulp.task('js:app:watch', function () {
    return gulp.watch(paths.js, ['js:app:watched']);
});

// js - app - watched
gulp.task('js:app:watched', function (callback) {
    return runSequence(
        'js:app:build',
        'js:app:concat',
        callback
    );
});

// js - vendor - build
gulp.task('js:vendor:build', function () {
    return gulp.src([
        paths.vendor + 'angular/angular.js',
        paths.vendor + 'angular-animate/angular-animate.js',
        paths.vendor + 'angular-aria/angular-aria.js',
        paths.vendor + 'angular-material/angular-material.js',
        paths.vendor + 'angular-messages/angular-messages.js',
        paths.vendor + 'angular-ui-router/release/angular-ui-router.js',
        paths.vendor + 'angular-resource/angular-resource.js',
        paths.vendor + 'angular-cookies/angular-cookies.js',
    ]).pipe(gulp.dest(paths.build + 'js/vendor'));
});

// js - vendor - concat
gulp.task('js:vendor:concat', function () {
    return gulp.src([
        paths.build + 'js/vendor/angular.js',
        paths.build + 'js/vendor/angular-animate.js',
        paths.build + 'js/vendor/angular-aria.js',
        paths.build + 'js/vendor/angular-material.js',
        paths.build + 'js/vendor/angular-messages.js',
        paths.build + 'js/vendor/angular-ui-router.js',
        paths.build + 'js/vendor/angular-resource.js',
        paths.build + 'js/vendor/angular-cookies.js',
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(paths.dist + 'js'));
});

// img
gulp.task('img', function () {
    gulp.src(paths.img)
        .pipe(gulp.dest(paths.dist + 'img'));
});

// img - watch
gulp.task('img:watch', function () {
    return gulp.watch(paths.js, ['img:watched']);
});

// img - watched
gulp.task('img:watched', function (callback) {
    return runSequence(
        'img',
        callback
    );
});

// lb services
gulp.task('lb-ng', function (callback) {
    return runSequence(
        'lb-ng:clean',
        'lb-ng:build',
        callback
    );
});

// lb services - build
gulp.task('lb-ng:build', function () {
    return gulp.src(path.join('server', 'server.js'))
        .pipe(lbAngular())
        .pipe(rename('lb-services.js'))
        .pipe(gulp.dest(paths.dist + 'js'))
});

// lb services - clean
gulp.task('lb-ng:clean', function () {
    return del(path.join(paths.dist + 'js', "*lb-services.js"))
});

// lb services - watch
gulp.task('lb-ng:watch', function () {
    return gulp.watch(paths.models, ['lb-ng']);
});

// nodemon
gulp.task('nodemon', function () {
    nodemon({
        script: path.join('server', 'server.js'),
        ext: 'js json',
        env: { 'NODE_ENV': NODE_ENV },
        watch: [
            path.join('server', '**', '*'),
            path.join('common', 'models'),
            path.join('modules', '**', 'common', 'models')
        ]
    });
});

// default gulp
gulp.task('default', function (callback) {
    return runSequence(
        ['css', 'html', 'js', 'img', 'lb-ng'],
        ['sass:watch', 'fonts:watch', 'html:watch', 'js:app:watch', 'img:watch', 'lb-ng:watch'],
        'nodemon',
        callback
    );
});