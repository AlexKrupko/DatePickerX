module.exports = function (grunt)
{
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    var comment = '/**\n\
 * DatePickerX\n\
 *\n\
 * Cool light visual date picker on pure JavaScript\n\
 * Browsers support: Chrome 45+, FireFox 40+, Safari 8+, IE10+, iOS Safari 8+, Android Browser 4.4+\n\
 *\n\
 * @author    Alexander Krupko <alex@avrora.team>\n\
 * @copyright 2016 Avrora Team www.avrora.team\n\
 * @license   MIT\n\
 * @tutorial  http://datepickerx.avrora.team\n\
 * @version   ' + grunt.file.readJSON('package.json').version + '\n\
 */\n';

    grunt.initConfig({

        sass: {
            options: {
                sourceMap  : false,
                outputStyle: 'expanded',
                indentWidth: 4
            },
            dev: {
                files  : [{
                    expand: true,
                    cwd   : 'src/sass',
                    src   : ['**/*.scss'],
                    dest  : 'dist/css',
                    ext   : '.css'
                }]
            }
        },

        autoprefixer: {
            options: {
                browsers: ['last 2 versions', '> 1%'],
                map     : false
            },
            files  : {
                expand : true,
                flatten: true,
                src    : 'dist/css/*.css',
                dest   : 'dist/css'
            }
        },

        clean: {
            options: {
                'force': true
            },
            css    : ['dist/css/*'],
            js     : ['dist/js/*']
        },

        uglify: {
            options: {
                quoteStyle: 3,
                banner: comment
            },
            js     : {
                files: [{
                    expand: true,
                    cwd   : 'src/js',
                    src   : '**/*.js',
                    dest  : 'dist/js',
                    ext   : '.min.js'
                }]
            }
        },

        copy: {
            options: {
                process: function(content, srcpath)
                {
                    return comment + '\n' + content;
                }
            },
            js     : {
                files: [{
                    expand: true,
                    cwd   : 'src/js',
                    src   : '**/*.js',
                    dest  : 'dist/js'
                }]
            },
            css     : {
                files: [{
                    expand: true,
                    cwd   : 'dist/css',
                    src   : '**/*.css',
                    dest  : 'dist/css'
                }]
            }
        },

        watch: {
            js: {
                files: ['src/js/**/*.js'],
                tasks: ['js']
            },
            css: {
                files: ['src/sass/**/*.scss'],
                tasks: ['css']
            }
        },

        cmq: {
            css: {
                files: [{
                    expand: true,
                    cwd   : 'dist/css',
                    src   : '**/*.css',
                    dest  : 'dist/css'
                }]
            }
        },

        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1,
                semanticMerging: true
            },
            target: {
                files: [{
                    expand: true,
                    cwd   : 'dist/css',
                    src   : '**/*.css',
                    dest  : 'dist/css',
                    ext   : '.min.css'
                }]
            }
        }

    });


    grunt.registerTask('css', ['clean:css', 'sass', 'autoprefixer', 'cmq', 'cssmin', 'copy:css']);
    grunt.registerTask('js', ['clean:js', 'copy:js', 'uglify']);

    grunt.registerTask('build', ['css', 'js']);
    grunt.registerTask('default', ['watch']);

};