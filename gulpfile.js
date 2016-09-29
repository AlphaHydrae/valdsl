var gulp = require('gulp'),
    lint = require('gulp-jshint'),
    mocha = require('gulp-spawn-mocha'),
    runSequence = require('run-sequence');

gulp.task('lint', function() {
  return gulp
    .src([ 'gulpfile.js', 'index.js', 'lib/**/*.js', 'spec/**/*.js' ])
    .pipe(lint());
});

gulp.task('spec', function() {
  return gulp
    .src('spec/**/*.spec.js')
    .pipe(mocha());
});

gulp.task('watch', function() {
  gulp.watch([ 'index.js', 'lib/**/*.js', 'spec/**/*.js' ], [ 'default' ]);
});

gulp.task('default', function(callback) {
  return runSequence('lint', 'spec', callback);
});
