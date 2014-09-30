var fs = require('fs');
// 引入 gulp
var gulp = require('gulp');

// 引入组件
var less = require('gulp-less');
var imagemin = require('gulp-imagemin');
var minifycss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var fileconcat = require('gulp-file-concat');
var resourcecache = require('gulp-static-cache');
var gulpDoxx = require('gulp-doxx');
/**
 * gulp config *
 * */
var gulpConf = {
	project: {
		name: JSON.parse(fs.readFileSync('./package.json')).name
	},
	tpl_default: './src/application/views/front/',
	tpl_output: './src/application/views/front/',
	static_default: './src/www/front/',
	static_output: './output/src/www/front/',
	static_dir: 'resource/'
};

gulpConf.less = {
	input: gulpConf.static_default + gulpConf.static_dir +'other/less/**/*.less',
	output: gulpConf.static_default + gulpConf.static_dir + 'css'
};
gulpConf.imgs = {
	input: gulpConf.static_default + gulpConf.static_dir +'img/**/*',
	output: gulpConf.static_output + gulpConf.static_dir +'img'
};
gulpConf.css = {
	combo: gulpConf.static_default + gulpConf.static_dir +'css/combo/**',
	input: [gulpConf.static_default + gulpConf.static_dir +'css/**/*.css', '!' + this.combo],
	output: gulpConf.static_output + gulpConf.static_dir +'css'
};
gulpConf.js = {
	combo: gulpConf.static_default + gulpConf.static_dir + 'js/combo/**',
	input: [gulpConf.static_default + gulpConf.static_dir + 'js/**/*.js', '!' + this.combo],
	output: gulpConf.static_output + gulpConf.static_dir + 'js'
};
gulpConf.tpl = {
	input: gulpConf.tpl_default + 'tpls/**',
	output: gulpConf.tpl_output + 'tpls'
};

// less => css
gulp.task('less', function () {
	gulp.src(gulpConf.less.input)
		.pipe(less())
		.pipe(gulp.dest(gulpConf.less.output))
});

// 压缩图片
gulp.task('images', function() {
	return gulp.src(gulpConf.imgs.input)
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest(gulpConf.imgs.output))
});

// 压缩 css
gulp.task('stylesheets', function() {
	return gulp.src(gulpConf.css.input)
		.pipe(minifycss())
		.pipe(gulp.dest(gulpConf.css.output))
});

// 检查js
gulp.task('lint', function() {
	return gulp.src(gulpConf.js.input)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// 压缩js文件
gulp.task('javascripts', function() {
	return gulp.src(gulpConf.js.input)
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(gulp.dest(gulpConf.js.output))
});

// js文件合并，通过document.write
gulp.task('concat_js', function(){
	return gulp.src(gulpConf.js.combo)
		.pipe(fileconcat({
			relativeUrls: gulpConf.static_default
		}))
		.pipe(gulp.dest(gulpConf.js.combo.substring(0, gulpConf.js.combo.length)))
});
// css文件合并，通过@import
gulp.task('concat_css', function(){
	return gulp.src(gulpConf.css.combo)
		.pipe(fileconcat())
		.pipe(gulp.dest(gulpConf.css.combo.substring(0, gulpConf.css.combo.length)))
});
// 静态文件版本号更新
gulp.task('cache_static', function(){
	return gulp.src(gulpConf.css.input)
		.pipe(resourcecache({
			relativeUrls: gulpConf.static_output
		}))
		.pipe(gulp.dest(gulpConf.css.output));
});
// 模板版本号更新
gulp.task('cache_tpl', function(){
	return gulp.src(gulpConf.tpl.input)
		.pipe(resourcecache({
			relativeUrls: gulpConf.static_output
		}))
		.pipe(gulp.dest(gulpConf.tpl.input));
});

gulp.task('docs', function() {
	gulp.src(gulpConf.js.input)
		.pipe(gulpDoxx({
			title: gulpConf.project.name
		}))
		.pipe(gulp.dest(gulpConf.static_default + 'docs'));
});

// 开发
gulp.task('dev', function(){
	gulp.run('less', 'docs');
	gulp.watch(gulpConf.less.input, ['less']);
	gulp.watch(gulpConf.js.input, ['docs']);
});

// 上线文件
gulp.task('online', function(){
	gulp.run('concat_css', 'concat_js', 'images', 'stylesheets', 'javascripts', 'cache_static', 'cache_tpl');
});
