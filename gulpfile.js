var gulp = require("gulp");
var browserify = require("gulp-browserify");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var mocha = require("gulp-mocha");

gulp.task("test", function() {
  return gulp.src("tests.js")
    .pipe(mocha());
});

gulp.task("build", function() {
  return gulp.src("index.js", { read: false })
    .pipe(browserify({
      // Generate UMD wrapper
      // Exposes window.immutable for use in browser
      standalone: "immutable"
    }))
    .pipe(uglify())
    .pipe(rename("immutable.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("default", ["test", "build"]);
