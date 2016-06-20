require.config({baseUrl: 'js'});

// and the 'jquery-private' module, in the
// jquery-private.js file:
define('jquery-private', ['jquery'], function ($) {
    return $.noConflict(true);
});

require(['jquery', 'knockout'], function($, knockout) {
    window.ko = knockout; // requirejs shim isn't working for knockout
    
    require(['writer',
             'delegator',
             'jquery.layout',
             'jquery.tablayout'
    ], function(Writer, Delegator) {
        $(function() {
            cwrcWriterInit.call(window, $, Writer, Delegator);
        });
    });
});

function cwrcWriterInit($, Writer, Delegator) {
    cwrc_params = {};
    
    writer = null;
    
    function doInit(config) {
        config.delegator = Delegator;
        writer = new Writer(config);
        writer.init('editor');
        writer.event('writerInitialized').subscribe(function(writer) {
            // load modules then do the setup
            require(['modules/entitiesList','modules/relations','modules/selection',
                     'modules/structureTree','modules/validation'
            ], function(EntitiesList, Relations, Selection, StructureTree, Validation) {
                setupLayoutAndModules(writer, EntitiesList, Relations, Selection, StructureTree, Validation);
                writer.fileManager.loadInitialDocument(window.location.hash);
            });
        });
    }
    
    (function() {
        var configXHR = $.ajax({url: 'js/writerConfig.js', dataType: 'json'});
        var projectXHR = $.ajax({url: 'http://apps.testing.cwrc.ca/editor/documents/info/projectname'});
        $.when(
            configXHR,
            projectXHR
        ).then(function(config, project) {
            config = config[0];
            project = project[0];
            config.project = project;
            config.cwrcRootUrl = window.location.protocol+'//'+window.location.host+window.location.pathname.replace(window.location.pathname.split('/').pop(),'');
            doInit(config);
        },function(xhr) {
            if (configXHR.state() === 'resolved') {
                var config = $.parseJSON(configXHR.responseText);
                config.cwrcRootUrl = window.location.protocol+'//'+window.location.host+window.location.pathname.replace(window.location.pathname.split('/').pop(),'');
                doInit(config);
            } else {
                alert('Error loading writerConfig.js');
            }
        });
    }());
};
