const
	gulp = require('gulp'),
	util = require('gulp-util'),
	concat = require('gulp-concat'),
	ts = require('gulp-typescript'),
	sass = require('gulp-sass'),
	merge = require('merge2'),
	replace = require('gulp-replace'),
	gulpIf = require('gulp-if');

const release = !!(util.env.r || util.env.release);

if (release) {
	util.log(`Running in ${util.colors.blue('RELEASE')} mode`);
}

const compiledModuleSeparator = `
})(ngSchedule || (ngSchedule = {}));
var ngSchedule;
(function (ngSchedule) {
`;
const tsProject = ts.createProject('tsconfig.json');
gulp.task('ts', function () {
	const projectSrc = gulp.src([
		'src/scripts/*.ts'])
		.pipe(concat('ngScheduler.ts'));

	return merge([projectSrc, gulp.src("typings/**/*.ts")])
		.pipe(ts(tsProject))
		.pipe(replace(compiledModuleSeparator, '\n\n'))
		.pipe(gulp.dest('build'))
		.pipe(gulpIf(release, gulp.dest('./')));
});

gulp.task('sass', function () {
	return gulp.src('src/styles/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('build'))
		.pipe(gulpIf(release, gulp.dest('./')));
});

gulp.task('default', ['ts', 'sass']);

gulp.task('watch', ['default'], function () {
	gulp.watch('src/**/*.ts', ['ts']);
	gulp.watch('src/**/*.scss', ['sass']);
});