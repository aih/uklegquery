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
   $scope.getCombinedQuery= function(){
       $scope.combinedQuery = queryFactory.getCombinedQuery($scope.inputXPath);
   };
   $scope.sendXPathQuery = function(querytext){
       initResults();
       queryFactory.queryUKLeg(querytext, $scope.options).then(function(ajaxdata){
        $scope.queryResults.xQueryResults = ajaxdata.toString();
       });
   };
   var initResults = function(){
        $scope.queryResults = {};
   };
}]);

ukleg.factory('queryFactory', function ($http, $q){
    var basedomain= 'http://54.172.251.13:8080';
    var basequeryurl= '/exist/rest/db/ukpga';
	var modules= 'import module namespace response = "http://exist-db.org/xquery/response";';
    var namespaceDec='declare namespace akn="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11";declare namespace response="http://exist-db.org/xquery/response";';
	var flwrStart='for $entry in ';
    var collection = 'collection(\'ukpga\')';
	var headers = ' let $headers :=(response:set-header("Access-Control-Allow-Origin", "*"))';
    var returnPhrase = ' return <div class="entry">{$entry}</div>';
    //Return public API
        return({
            queryUKLeg: queryUKLeg,
            getCombinedQuery : function(inputXPath){
                return "collection('ukpga')"+inputXPath;
            }
            });

        function queryUKLeg(inputXPath, options){
            var request = $http({
                        method: "get",
                        url: basedomain + basequeryurl,
                        params: {
                            _query: namespaceDec+flwrStart+collection+inputXPath+headers+returnPhrase,
                            _howmany: options.howManyResults
                        }
                    });

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
