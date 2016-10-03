var _ = require('lodash'),
    addSrc = require('gulp-add-src'),
    babel = require('gulp-babel'),
    gulp = require('gulp'),
    lint = require('gulp-jshint'),
    mocha = require('gulp-spawn-mocha'),
    path = require('path'),
    runSequence = require('run-sequence'),
    through = require('through2'),
    util = require('gulp-util'),
    watch = require('gulp-watch');

var srcDir = path.resolve('src');

gulp.task('babel', function() {
  return gulp
    .src('src/**/*.js')
    .pipe(compileBabel())
    .pipe(gulp.dest('lib'));
});

gulp.task('lint', function() {
  return gulp
    .src([ 'gulpfile.js', 'index.js', 'src/**/*.js', 'spec/**/*.js' ])
    .pipe(lint());
});

gulp.task('spec', function() {
  return gulp
    .src('spec/**/*.spec.js')
    .pipe(mocha());
});

gulp.task('test', function(callback) {
  return runSequence('lint', 'babel', 'spec', callback);
});

gulp.task('watch', function() {
  return watch([ 'index.js', 'spec/**/*.js', 'src/**/*.js' ], function(file) {
    if (file.path.indexOf(srcDir + '/') === 0) {
      gulp
        .src(file.path)
        .pipe(compileBabel())
        .pipe(gulp.dest('lib'))
        .pipe(clear())
        .pipe(addSrc('spec/**/*.js'))
        .pipe(mocha())
        .on('error', _.noop);
    } else {
      gulp
        .src('spec/**/*.spec.js')
        .pipe(mocha())
        .on('error', _.noop);
    }
  });
});

gulp.task('default', function(callback) {
  return runSequence('lint', 'spec', callback);
});

function compileBabel() {
  return babel({
    presets: [ 'es2015' ]
  });
}

function clear() {
  return through.obj(function(file, enc, callback) {
    callback();
  });
}
