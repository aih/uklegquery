/**
 * xreader - generic xml reader in angularjs
 * @version v0.0.1
 * @license MIT
 * @author Ari Hershowitz <arihershowitz@gmail.com>
 */
(function(){
    var xr = angular.module('xr', ['ng']);
    
    xr.config(['$locationProvider', '$httpProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);

xr.directive("xrReader",['$parse', '$compile', 'readerFactory', function($parse, $compile, readerFactory){
    return {
        replace: true,
        link: function(scope, elements, attributes) {
            readerFactory.setReaderId(scope.readerName, attributes.id);
            var xmlGetter = $parse(attributes.xmlsource);
            if(attributes.xmlsource){
                scope.$watch(attributes.xmlsource, function(){
                    var xmlSource = xmlGetter(scope);
                    readerFactory.setReaderXML(scope.readerName, xmlSource);
                    var xElement = angular.element(xmlSource || '');
                    readerFactory.currentElement=xElement;
                    var html = '<div></div>';
                    var e = angular.element(html);
                    e.empty().append(xElement);
                    elements.empty().append(e);
                    $compile(e)(scope);
                });
                }
        }

    };
}]);

xr.factory('readerFactory', function(){

    var readers = {};

    return{
        currentElement: {},
        getReaders: function(){
            return readers;
        },
        getReader: function(readerName){
            return readers[readerName];
        },
        setReaderId: function(readerName, id){
            readers[readerName] = {id: id}; 
        },
        setReaderXML: function(readerName, docXML){
               var localDocXML = docXML?docXML:'';
               readers[readerName].xml=  localDocXML;
           },
        getReaderXML: function(readerName){
               var readerXML =  (readers[readerName] && readers[readerName].xml)? readers[readerName].xml : '<div>Load XML Document</div>';
               return readerXML;
           },
        clearReaderXML: function(readerName){
            this.setReaderXML(readerName, '<div>Load XML Document</div>');
        },
        scrollToSelector :function(readerName, selector){
                var docContainerId = this.getReader(readerName).id; 
                var fnDocContainerId = docContainerId?docContainerId:"docContainer";
                var selectorElement = jQuery(selector)[0];
               // selectorElement.scrollIntoView();
                var container = document.getElementById(docContainerId);
                container.scrollTop = selectorElement.offsetTop - container.offsetTop;
            },
        scrollToTop :function(readerName){
                var docContainerId = this.getReader(readerName).id; 
                var fnDocContainerId = docContainerId?docContainerId:"docContainer";
                jQuery(fnDocContainerId.addHash()).scrollTop(0);
            },
        scrollToBottom: function(readerName){
                var docContainerId = this.getReader(readerName).id; 
                var fnDocContainerId = docContainerId?docContainerId:"docContainer";
                var container = jQuery(fnDocContainerId.addHash());
                var height = container.find(':first').height();
                container.scrollTop(height);
                console.log(height);
            },
        downloadFile : function(readerName, filename){
                var fileText = this.getReaderXML(readerName);
                var downloadFilename = filename? filename : 'document.xml';
                saveTextAs(fileText, downloadFilename);
            }
    };

});

String.prototype.addHash = function(){
    return this.replace(/^#?/,'#');
};

})();
