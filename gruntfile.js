module.exports = function(grunt){
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

		uglify: {
			options: {
				mangle: false,
                sourceMap: true
			},
			build: {
				files: {
					'dist/js/rm-chart-library.min.js': [
						'src/vendor/jquery.inview2/jquery.inview2.modified.js',
						'src/js/rm-bar-chart.js',
						'src/js/rm-donut-chart.js',
						'src/js/rm-scatter-plot.js',
						'src/js/rm-double-bar-chart.js',
					]
				}
			}
		},
		
		less: {
		  development: {
			options: {
			  paths: ["src/less"],
			  compress: true,
			  sourceMap: true
			},
			files: {
			  	"dist/css/rm-chart-library.min.css": "src/less/rm-chart-library.less",
			}
		  }
		},

		watch: {    
			less: {
				files: ['src/less/*.less', 'src/less/**/*.less'],
				tasks: ['less']
			},
			
			js: {
				files: ['src/js/*.js', 'src/**/*.js'],
				tasks: ['uglify']
			}
		}
    });

    grunt.registerTask('default', []);

};