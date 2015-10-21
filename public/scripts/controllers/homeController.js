'use strict';

var snapwattApp = angular.module('snapwattApp');


snapwattApp.config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(5000);
}]);



snapwattApp.controller('HomeCtrl', 
   	['$scope', '$timeout', '$routeParams', '$location', '$window',
   	function ($scope, $timeout, $routeParams, $location, $window) {
   		$scope.goToPage = function(path){
		$location.path(path);
		
	};

   		var currentUser = Parse.User.current();
			if (currentUser) {
			   $scope.goToPage('/dashboard');
			};



   		$scope.login = function () {
   			Parse.FacebookUtils.logIn(null, {
			  success: function(user) {
			    if (!user.existed()) {
			      takeThemIn('/setup');
			    } else {
			      takeThemIn('/dashboard');
			    }
			  },
			  error: function(user, error) {
			    alert("User cancelled the Facebook login or did not fully authorize.");
			  }
			});
   		};

   		function takeThemIn (path) {
   			 $timeout(function() {
				    	console.log('timeout run');
				    	$location.path(path);
				    	$scope.$apply();
				    	$window.location.reload();
				    }, 1000);
   		};
 	
 	
	$scope.showEmail = false;
        $scope.showEmailSignup = function () {
            $scope.showEmail = $scope.showEmail === false ? true: false;

        };

    $scope.emailSignup = function (){
    	var user = new Parse.User();
    	var email = $scope.email;
    	var firstname = $scope.fname;
    	var password = $scope.password;

		user.set("username", email);
		user.set("password", password);
		user.set("email", email);
		user.set("firstname", firstname);
		 
		 
		user.signUp(null, {
		  success: function(user) {
		    takeThemIn('/setup');
		  },
		  error: function(user, error) {
		    // Show the error message somewhere and let the user try again.
		    alert("Error: " + error.code + " " + error.message);
		  }
		});

    };

   	}]);
