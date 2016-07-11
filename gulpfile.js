var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    less = require('gulp-less'),
    nodemon = require('gulp-nodemon'),
    path = require('path'),
    paths = {
      scripts: [
        'public/core/*.js',
        'public/features/*.js',
        'public/features/**/*.js',
        'server/*.js',
        'server/**/*.js'
      ],
      styles: [
        './public/*.less'
      ]
    };


gulp.task('lint', function () {
  return gulp.src(paths.scripts)
      .pipe(eslint())
      .pipe(eslint.formatEach());
});

gulp.task('less', function () {
  return gulp.src(paths.styles)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./public/'));
});

gulp.task('nodemon', function () {
  nodemon({
    script: 'server.js',
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  })
})

// The default task (called when you run `gulp` from cli)
gulp.task('server', ['less', 'lint', 'nodemon']);