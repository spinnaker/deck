var gulp = require('gulp')

gulp.task('build:css', function () {
    var concat = require('gulp-concat')
    var postcss = require('gulp-postcss')
    var autoprefixer = require('autoprefixer')
    var customProperties = require('postcss-custom-properties')
    var Import = require('postcss-import')
    var styleGuide = require('postcss-style-guide')
    var nano = require('cssnano')

    return gulp.src('./app.css')
        .pipe(postcss([
            Import,
            customProperties({ preserve: true }),
            autoprefixer,
            styleGuide({
                project: 'Project name',
                dest: 'styleguide/index.html',
                showCode: false,
                themePath: '../'
            }),
            nano
        ]))
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest('dist/css'))
})
