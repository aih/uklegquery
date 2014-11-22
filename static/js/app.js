(function(){
    var ukleg = angular.module('ukleg', ['ng','xr']);

ukleg.config(['$locationProvider', '$httpProvider', function ($locationProvider, $httpProvider) {
    
    $locationProvider.html5Mode(true);
}]);

ukleg.controller('rootController', ['$scope', 'queryFactory', function ($scope, queryFactory) {

   $scope.inputXPath = '';
   $scope.combinedQuery = '';
   $scope.getCombinedQuery= function(){
       $scope.combinedQuery = queryFactory.getCombinedQuery($scope.inputXPath);
   };
}]);

ukleg.factory('queryFactory', function (){

    return{
        getCombinedQuery : function(inputXPath){
            return "collection('ukpga')"+inputXPath;
        }
    };
});


})();
