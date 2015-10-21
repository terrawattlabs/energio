'use strict';

var snapwattApp = angular.module('snapwattApp');

snapwattApp.controller('SetupCtrl', 
   	['$scope', '$timeout', '$routeParams', '$location', '$window',
   	function ($scope, $timeout, $routeParams, $location, $window) {


		$scope.fName;
		$scope.lName;
		var currentUser = Parse.User.current();
			if (currentUser) {
			   /* make the API call */
				FB.api(
				    "/me",
				    function (response) {
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
			   
			};

		$scope.setup = function () {
		

			// create the location 

			//take symbols out of phone number
			var stripedPhone = $scope.phone.replace(/[^\d]/g, '');
			// remove '1' if its the first number
			var processedPhone = stripedPhone.replace(/^[1]/, '');
			// add '+1' to the phone number
			var readyPhone = '+1' + processedPhone;


			var userPhone = readyPhone;
			var location_friendly = "Home";
			var account_name = $scope.fName + " " + $scope.last_name;
			var name_1 = $scope.fName;

			var Locations = Parse.Object.extend("Locations");
			var location = new Locations();
			 
			location.set("phone_1", userPhone);
			location.set("friendly", location_friendly);
			location.set("account_name", account_name);
			location.set("name_1", name_1);
			location.set("owner", currentUser);
			location.set("elec_cost", 0.15);

			 
			location.save(null, {
			  success: function(location) {
			    // Execute any logic that should take place after the object is saved.
	
			    	saveReading(location);
			  },
			  error: function(location, error) {
			    // Execute any logic that should take place if the save fails.
			    // error is a Parse.Error with an error code and message.
			    alert('Failed to create new object, with error code: ' + error.message);
			  }
			});

			


		};

		function saveReading (loc) {

			// add the first meter reading
			var Meter_Readings = Parse.Object.extend("Meter_Readings");
			var reading = new Meter_Readings();

			var readInput = parseFloat($scope.reading);
			 
			reading.set("kwh_read", readInput);
			reading.set("location", loc);
			
			 
			reading.save(null, {
			  success: function(reading) {
			    // Execute any logic that should take place after the object is saved.
			    alert('New object created with objectId: ' + reading.id);
			  },
			  error: function(reading, error) {
			    // Execute any logic that should take place if the save fails.
			    // error is a Parse.Error with an error code and message.
			    alert('Failed to create new object, with error code: ' + error.message);
			  }
			});
		};


		$scope.disableSubmit = true;


	$scope.validatePhone = function () {
	var currentPhone = $scope.phone;
	if (currentPhone.length == 0) {
		producePrompt('Phone is Required');
		$scope.phoneReady = false;
		$scope.isStatus = false;
		submitReady();
		return false
	}
	if(!currentPhone.match(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/)) {
		producePrompt('We need a real US number please');
		$scope.phoneReady = false;
		$scope.isStatus = false;
		submitReady();
		return false
	}
		producePrompt("Now, thats a cool number!");
		$scope.phoneReady = true;
		$scope.isStatus = true;
		submitReady();
		return true
};

	function producePrompt (msg, loc){
		$scope.phone_helper = msg;
	};

	function submitReady(){
		if ($scope.phoneReady == true) {
			$scope.disableSubmit = false;
		} else {
			$scope.disableSubmit = true;
		};
		
	};
		

}]);