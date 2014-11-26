(function(){
    var ukleg = angular.module('ukleg', ['ng','xr']);

ukleg.config(['$locationProvider', '$httpProvider', function ($locationProvider, $httpProvider) {
    
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.headers.common = {Accept: 'text/xml, */*'};
}]);


ukleg.controller('rootController', ['$scope', 'queryFactory', 'readerFactory', function ($scope, queryFactory, readerFactory) {

   $scope.inputXPath = '';
   $scope.queryResults={};
   $scope.options={howManyResults: 100};
   $scope.combinedQuery = '';
   $scope.getSelectedQuery = function(){ return _.find($scope.examples,function(example){return example.xpath===$scope.inputXPath;});};
   
   $scope.getCombinedQuery= function(){
       $scope.combinedQuery = queryFactory.getCombinedQuery($scope.inputXPath);
   };
   $scope.sendXPathQuery = function(querytext){
       initResults();
       alertify.log('Looking up results...');
       $scope.queryExplanation = $scope.getSelectedQuery() ? $scope.getSelectedQuery().explanation : '';
       queryFactory.queryUKLeg(querytext, $scope.options).then(function(ajaxdata){
       var jResults = jQuery(ajaxdata);
       $scope.queryResults.count = jResults.attr('exist:count');
       $scope.queryResults.totalResults = jResults.attr('exist:hits');
        $scope.queryResults.xQueryResults = ajaxdata.toString();
       }).then(function(){jQuery('.alertify-log').click();});
   };
   var initResults = function(){
        $scope.queryResults = {};
   };

   $scope.setQuery = function(query){
        $scope.inputXPath = query.xpath;
        $scope.queryExplanation=query.explanation;
   }

   /**
    * Array of examples
    */
   $scope.examples = queryFactory.examples;
}]);

ukleg.factory('queryFactory', function ($http, $q){
    var namespaces ={
        akn:'"http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11"',
        response:'"http://exist-db.org/xquery/response"',
        dct:'"http://purl.org/dc/terms/"',
        ukm:'"http://www.legislation.gov.uk/namespaces/metadata"',
        ukl:'"http://www.legislation.gov.uk/namespaces/legislation"',
        atom:'"http://www.w3.org/2005/Atom"',
        dc:'"http://purl.org/dc/elements/1.1/"'
    };
    var namespaceDecs = '';
    for(var key in namespaces){
        namespaceDecs=namespaceDecs+'declare namespace '+key+'='+namespaces[key]+';';
    }
    var basedomain= 'http://54.172.251.13:8080';
    var basequeryurl= '/exist/rest/db/ukpga';
	var modules= 'import module namespace response = "http://exist-db.org/xquery/response";';
    var flwrStart='for $entry in ',
        flwrStartCount='for $entry in count(',
        flwrEndCount=')';
    var collection = 'collection(\'ukpga\')';
	var headers = ' let $headers :=(response:set-header("Access-Control-Allow-Origin", "*"))';
    var returnPhrase = ' return <div class="entry">{$entry}</div>',
        returnPhraseCount = 'return $count';


    var examples = [
        {"xpath": "//akn:section[ancestor::akn:act//dc:subject='Councils']",
    "explanation":"Sections with the subject 'Councils'"},
    {"xpath":"//akn:p[./akn:ref]","explanation":"Paragraphs containing references"},
    {"xpath":"//akn:section[ancestor::akn:act//dc:subject='Councils']","explanation":"Sections in Acts relating to 'Councils'"},
    {"xpath":"//akn:section[contains(.,'asbestos')]","explanation":"Sections relating to 'Asbestos'"}
   ];

    //Return public API
        return({
            queryUKLeg: queryUKLeg,
            getCombinedQuery : function(inputXPath){
                return "collection('ukpga')"+inputXPath;
            },
            examples: examples,
            setQuery: setQuery
            });


        function setQuery(queryPath){
            return queryPath;
        };

        function queryUKLeg(inputXPath, options){
            if(options.countResults){
                var request = $http({
                        method: "get",
                        url: basedomain + basequeryurl,
                        params: {
                            _query: namespaceDecs+flwrStartCount+collection+inputXPath+flwrEndCount+headers+returnPhrase
                        }
                    });
            }else{
                var request = $http({
                        method: "get",
                        url: basedomain + basequeryurl,
                        params: {
                            _query: namespaceDecs+flwrStart+collection+inputXPath+headers+returnPhrase,
                            _howmany: options.howManyResults
                        }
                    });
            }

            return( request.then ( handleSuccess, handleError ) );
        }

        /*
         * PRIVATE METHODS
         */
        function handleError( response ) {
            jQuery('.alertify-log').click();
            alertify.error('(status: '+response.status+') An error occurred: '+ response.statusText);
            if (
                    ! angular.isObject( response.data ) ||
                    ! response.data.message
                    ) {
                        return( $q.reject( "An unknown error occurred") );
                    }
 
                    // Otherwise, use expected error message.
                    return( $q.reject( response.data.message ) );
 
                }

        function handleSuccess( response ) {
 
                    return( response.data );
 
                }

        });


})();
