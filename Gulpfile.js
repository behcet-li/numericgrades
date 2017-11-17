var gulp = require('gulp');
var declare = require('gulp-declare');
var concat = require('gulp-concat');
var ractive = require('gulp-ractive');

gulp.task('ractive_templates', function () {
  return gulp.src('src/templates/*.html')
    .pipe(ractive({
      preserveWhitespace: true
    }))
    .pipe(declare({
      namespace: 'Templates',
      noRedeclare: true // Avoid duplicate declarations
    }))
    .pipe(concat('templates_compiled.js'))
    .pipe(gulp.dest('./src/templates/'));
});

// gulp.watch(['src/templates#<{(|.html'], ['ractive_templates']);
