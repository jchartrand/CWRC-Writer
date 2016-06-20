require.config({baseUrl: 'js'});

// and the 'jquery-private' module, in the
// jquery-private.js file:
define('jquery-private', ['jquery'], function ($) {
    return $.noConflict(true);
});

require(['jquery', 'knockout'], function($, knockout) {
    window.ko = knockout; // requirejs shim isn't working for knockout
    
    require(['writer',
             'delegator'
    ], function(Writer, Delegator) {
        $(function() {
            cwrcWriterInit.call(window, $, Writer, Delegator);
        });
    });
});

function cwrcWriterInit($, Writer, Delegator) {
    cwrc_params = {};
    
    writer = null;
    
    function doResize() {
        var uiHeight = 4;
        var toolbar = $('.mce-toolbar-grp',writer.editor.getContainer());
        if (toolbar.is(':visible')) {
            uiHeight += toolbar.outerHeight();
        }
        $('iframe',writer.editor.getContainer()).height($(window).height() - uiHeight);
    }
    
    var config = {
        "buttons1": 'schematags,removeTag,editTag,|,viewsource',
        "delegator": Delegator,
        "cwrcRootUrl": window.location.protocol+'//'+window.location.host+window.location.pathname.replace(window.location.pathname.split('/').pop(),''),
        "schemas": {
            "tei": {
                "name": "CWRC Basic TEI Schema",
                "url": "xml/cwrc_tei_lite.rng",
                "cssUrl": "",
                "schemaMappingsId": "tei"
            }
        }
    }
    
    writer = new Writer(config);
    writer.init('editor');
    writer.event('writerInitialized').subscribe(function(writer) {
        var url = writer.cwrcRootUrl+'xml/blank_tei.xml';
        writer.fileManager.loadDocumentFromUrl(url);
    });
    writer.event('writerInitialized').subscribe(doResize);
    $(window).on('resize', doResize);

};
