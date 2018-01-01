var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var runElectron = require("gulp-run-electron");
var lbAngular = require('gulp-loopback-sdk-angular');
var rename = require('gulp-rename');
var path = require('path');
var del = require('del');

// paths
var paths = {
    sass:   'sass/**/*.scss',
    fonts:  'sass/fonts/**/*',
    html:   'html/**/*.html',
    js:     'js/**/*.js',
    img:    'img/**/*',
    vendor: 'vendor/',
    build:  'build/',
    dist:   'build/dist/'
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
        paths.vendor + 'angular-material/angular-material.css',
        paths.vendor + 'utatti-perfect-scrollbar/css/perfect-scrollbar.css'
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
        'electron:restart',
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
        .pipe(gulp.dest(paths.dist + 'html'));
});

// html - watch
gulp.task('html:watch', function () {
    return gulp.watch(paths.html, ['html:watched']);
});

// html -watched
gulp.task('html:watched', function (callback) {
    return runSequence(
        'html',
        'electron:restart',
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
        'electron:restart',
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
        paths.vendor + 'angular-live-set/dist/live-set.js',
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
        paths.build + 'js/vendor/live-set.js',
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
        'electron:restart',
        callback
    );
});

// electron - run
gulp.task('electron:run', function () {
    gulp.src('./')
        .pipe(runElectron([], {cwd: __dirname}));
});

// electron restart
gulp.task('electron:restart', runElectron.rerun);

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
    gulp.src(path.join('..', 'web', 'server', 'server.js'))
        .pipe(lbAngular({
            apiUrl: 'http://localhost:3000/api'
        }))
        .pipe(rename('lb-services.js'))
        .pipe(gulp.dest(paths.dist + 'js'))
});

// lb services - clean
gulp.task('lb-ng:clean', function () {
    return del(path.join(paths.dist + 'js', "*lb-services.js"))
});

// default gulp
gulp.task('default', function (callback) {
    runSequence(
        ['css', 'html', 'js', 'img', 'lb-ng'],
        ['sass:watch', 'fonts:watch', 'html:watch', 'js:app:watch', 'img:watch'],
        'electron:run',
        callback
    );
});