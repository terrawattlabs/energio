'use strict';

var snapwattApp = angular.module('snapwattApp');

snapwattApp.controller('NavCtrl', 
   	['$scope', '$timeout', '$routeParams', '$location', '$window',
   	function ($scope, $timeout, $routeParams, $location, $window) {

   		console.log('Im the nav controller');

		$scope.fName;
		$scope.lName;
		var currentUser = Parse.User.current();
			if (currentUser) {
			   /* make the API call */
				FB.api(
				    "/me",
				    function (response) {
				    	console.log(response);
				    	console.log(response.error);
				      if (response && !response.error) {
				      	console.log(response);
				      	console.log(response.first_name);
				        $scope.fName = response.first_name;
				        $scope.lName = response.last_name;
				        $scope.$apply();
				      }
				    }
				);
			} else {
				console.log('else block in navctrl');
			  $scope.goToPage('/'); 
			};

			$scope.goToPage = function(path) {
			$location.path(path);
			
			};

			$scope.isLoggedIn = function() {
				return false;
			};

			$scope.logOut = function (){
				Parse.User.logOut();
				$scope.goToPage('/');
				window.location.reload();
;			};

}]);