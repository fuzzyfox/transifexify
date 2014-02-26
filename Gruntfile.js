module.exports = function(grunt) {
	grunt.initConfig({
		// running `grunt less` will compile once
		less: {
			development: {
				options: {
					paths: ["./"],
					yuicompress: true
				},
				files: {
					"transifexify.css": "transifexify.less"
				}
			}
		},
		autoprefixer: {
			development: {
				browsers: ['last 2 versions'],
				expand: true,
				flatten: true,
				src: "./*.css",
				dest: "."
			}
		},
		concat: {
			dist: {
				src: [
				'vendor/EventTarget.addEventListener/EventTarget.addEventListener.js',
				'vendor/dom-TreeWalker-polyfill/src/TreeWalker-polyfill.js',
				'vendor/html5-dataset/html5-dataset.js',
				'src/transifexify.js',
				'src/transifexify-sidebar.js'
				],
				dest: 'transifexify-bookmarklet.js',
			},
		},
		uglify: {
			options: {
				mangle: false,
				sourceMap: true
			},
			files: {
				'transifexify-bookmarklet.min.js': ['transifexify-bookmarklet.js']
			}
		},
		// running `grunt watch` will watch for changes
		watch: {
			less: {
				files: ["./*.less", "./src/*.js"],
				tasks: ["less", "concat", "uglify"]
			},
			// prefixing: {
			// 	files: "./teach-assets/css/*.css",
			// 	tasks: ['autoprefixer']
			// }
		}
	});
grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-autoprefixer');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.registerTask('default', ['less', 'autoprefixer', 'uglify']);
grunt.registerTask('build', ['less', 'autoprefixer', 'uglify']);
};
