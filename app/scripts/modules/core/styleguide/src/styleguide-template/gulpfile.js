var gulp = require('gulp')

gulp.task('default', function () {
    var postcss = require('gulp-postcss')
    var Import = require('postcss-import')
    var autoprefixer = require('autoprefixer')
    var flexbugs = require('postcss-flexbugs-fixes')

    return gulp.src('./style.css')
        .pipe(postcss([
            Import,
            autoprefixer,
            flexbugs
        ]))
        .pipe(gulp.dest('./'))
})
