var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    path = require('path'),
    paths = {
      scripts: [
        'public/core/*.js',
        'public/features/*.js',
        'public/features/**/*.js',
        'server/*.js',
        'server/**/*.js'
      ]
    };

gulp.task('nodemon', function () {
  nodemon({
    script: 'server.js',
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  })
})

// The default task (called when you run `gulp` from cli)
gulp.task('server', ['nodemon']);