(function(){
    var ukleg = angular.module('ukleg', ['ng','xr']);

ukleg.config(['$locationProvider', '$httpProvider', function ($locationProvider, $httpProvider) {
    
    $locationProvider.html5Mode(true);
    $httpProvider.defaults.headers.common = {Accept: 'text/xml, */*'};
}]);

ukleg.controller('rootController', ['$scope', 'queryFactory', function ($scope, queryFactory) {

   $scope.inputXPath = '';
   $scope.combinedQuery = '';
   $scope.getCombinedQuery= function(){
       $scope.combinedQuery = queryFactory.getCombinedQuery($scope.inputXPath);
   };
   $scope.sendXPathQuery = function(){
       return queryFactory.queryUKLeg($scope.inputXPath);
   };
}]);

ukleg.factory('queryFactory', function ($http, $q){
    var basedomain= 'http://localhost:8080';
    var basequeryurl= '/exist/rest/db/ukpga';
	var modules= 'import module namespace response = "http://exist-db.org/xquery/response";';
    var namespaceDec='declare namespace akn="http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD11";declare namespace response="http://exist-db.org/xquery/response";';
	var flwrStart='for $section in ';
    var collection = 'collection(\'ukpga\')';
	var headers = ' let $headers :=(response:set-header("Access-Control-Allow-Origin", "*"))';
    var returnPhrase = ' return <entry>{$section}</entry>';
    //Return public API
        return({
            queryUKLeg: queryUKLeg,
            getCombinedQuery : function(inputXPath){
                return "collection('ukpga')"+inputXPath;
            }
            });
        /*
         * PUBLIC METHODS
         */

        function queryUKLeg(inputXPath){
            var request = $http({
                        method: "get",
                        url: basedomain + basequeryurl,
                        params: {
                            _query: namespaceDec+flwrStart+collection+inputXPath+headers+returnPhrase
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
