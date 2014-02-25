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
					"./transifexify.css": "./transifexify.less"
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
		// running `grunt watch` will watch for changes
		watch: {
			less: {
				files: "./*.less",
				tasks: ["less"]
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
	grunt.registerTask('default', ['less', 'autoprefixer']);
	grunt.registerTask('build', ['less', 'autoprefixer']);
};
