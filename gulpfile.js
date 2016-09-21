const gulp = require('gulp'),
	concat = require('gulp-concat'),
	ts = require('gulp-typescript'),
	sass = require('gulp-sass'),
	merge = require('merge2'),
	replace = require('gulp-replace');

const compiledModuleSeparator = `
})(ngSchedule || (ngSchedule = {}));
var ngSchedule;
(function (ngSchedule) {
`;
var tsProject = ts.createProject('tsconfig.json');
gulp.task('ts', function () {
	const projectSrc = gulp.src([
		'src/scripts/*.ts'])
		.pipe(concat('ngScheduler.ts'));

	return merge([projectSrc, gulp.src("typings/**/*.ts")])
		.pipe(ts(tsProject))
		.pipe(replace(compiledModuleSeparator, '\n\n'))
		.pipe(gulp.dest('build'));
});

gulp.task('sass', function () {
	return gulp.src('src/styles/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('build'));
});

gulp.task('default', ['ts', 'sass']);

gulp.task('watch', ['default'], function () {
	gulp.watch('src/**/*.ts', ['ts']);
	gulp.watch('src/**/*.scss', ['sass']);
});