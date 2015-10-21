'use strict';

var snapwattApp = angular.module('snapwattApp');

snapwattApp.controller('locationCtrl', 
   	['$scope', '$timeout', '$routeParams', '$location', '$window', 'growl',
   	function ($scope, $timeout, $routeParams, $location, $window, growl) {
   		var currentUser = Parse.User.current();
   		
   		var locationID = $routeParams.objID;

   		
   		$scope.locFriendly;
   		$scope.locAddress;
   		$scope.locCity;
   		$scope.locState;
   		$scope.locZip;
   		$scope.p1name;
   		$scope.p1phone;
   		$scope.p2name;
   		$scope.p2phone;
   		$scope.p3name;
   		$scope.p3phone;
   		$scope.p4name;
   		$scope.p4phone;
   		$scope.p5name;
   		$scope.p5phone;

   		
   		var Locations = Parse.Object.extend("Locations");
		var query = new Parse.Query(Locations);
		query.equalTo("objectId", locationID);
		query.find({
		  success: function(locations) {
		  	console.log(locations);
		  	var dayIndex = locations[0].get('day');
		  	$scope.selDay = $scope.days[dayIndex];
		  	if (locations[0].get('frequency') == 'daily') {
		  		$scope.radioModel = 'daily';
		  	} else {
		  		$scope.radioModel = 'weekly';
		  		var dayIndex = locations[0].get('day');
		  		$scope.selDay = $scope.days[dayIndex];
		  	};

		    $scope.locFriendly = locations[0].get('friendly');
	   		$scope.locAddress = locations[0].get('address');
	   		$scope.locCity = locations[0].get('city');
	   		$scope.locState = locations[0].get('state');
	   		$scope.locZip = locations[0].get('zip');
	   		$scope.p1name = locations[0].get('name_1');
	   		$scope.p1phone = locations[0].get('phone_1');
	   		$scope.p2name = locations[0].get('name_2');
	   		$scope.p2phone = locations[0].get('phone_2');
	   		$scope.p3name = locations[0].get('name_3');
	   		$scope.p3phone = locations[0].get('phone_3');
	   		$scope.p4name = locations[0].get('name_4');
	   		$scope.p4phone = locations[0].get('phone_4');
	   		$scope.p5name = locations[0].get('name_5');
	   		$scope.p5phone = locations[0].get('phone_5');
	   		$scope.locCost = locations[0].get('elec_cost');
		    $scope.$apply();
		  },
		  error: function(object, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		  }
		});


    	$scope.goToPage = function(path){
		$location.path(path);
		
		};

		$scope.saveLocation = function (){
		
				var newFriendly = $scope.locFriendly;
				var newAddress = $scope.locAddress;
				var newCity = $scope.locCity;
				var newState = $scope.locState;
				var newZip = $scope.locZip;
				var newP1name = $scope.p1name;
				var newP1phone = processNumber($scope.p1phone);
				var newP2name = $scope.p2name;
				var newP2phone = processNumber($scope.p2phone);
				var newP3name = $scope.p3name;
				var newP3phone = processNumber($scope.p3phone);
				var newP4name =	$scope.p4name;
				var newP4phone = processNumber($scope.p4phone);
				var newP5name = $scope.p5name;
				var newP5phone = processNumber($scope.p5phone);
				var newCost = $scope.locCost;
				
				var newFrequency = $scope.radioModel;
				var newDay;
				if ($scope.radioModel == 'weekly') {
					 newDay = $scope.selDay.value;
				} else {
					newDay = 0;
				}

	   
	 			var Locations = Parse.Object.extend("Locations");
				var query = new Parse.Query(Locations);

				query.equalTo("objectId", $routeParams.objID);

				query.first({
				  success: function(object) {
				     object.set("friendly", newFriendly);
				     object.set("address", newAddress);
				     object.set("city", newCity);
				     object.set("state", newState);
				     object.set("zip", newZip);
				     object.set("name_1", newP1name);
				     object.set("phone_1", newP1phone);
				     object.set("name_2", newP2name);
				     object.set("phone_2", newP2phone);
				     object.set("name_3", newP3name);
				     object.set("phone_3", newP3phone);
				     object.set("name_4", newP4name);
				     object.set("phone_4", newP4phone);
				     object.set("name_5", newP5name);
				     object.set("phone_5", newP5phone);
				     object.set("elec_cost", newCost);
				     object.set("frequency", newFrequency);
				     object.set("day", newDay);
				 
				   	 object.save();
				   	 growl.addSuccessMessage("success", "Location Saved");
				  },
				  error: function(error) {
				    alert("Error: " + error.code + " " + error.message);
				  }
				});
 	}; //end update notes


 	$scope.days = [
 	{readable: "Sunday", value: 0},
 	{readable: "Monday", value: 1},
 	{readable: "Tuesday", value: 2},
 	{readable: "Wednesday", value: 3},
 	{readable: "Thursday", value: 4},
 	{readable: "Friday", value: 5},
 	{readable: "Saturday", value: 6}
 	];



 	$scope.changeSelectedDay = function (day) {

		console.log(day);
		console.log('in function');
		$scope.selDay = day;
		};

	function processNumber (str){
		var result;
			if (str == undefined || str == "") {
				console.log('got into the true part');
				result = undefined;
			} else {
				console.log('got into false part');
				//take symbols out of phone number
				var stripedPhone = str.replace(/[^\d]/g, '');
				// remove '1' if its the first number
				var processedPhone = stripedPhone.replace(/^[1]/, '');
				// add '+1' to the phone number
				var readyPhone = '+1' + processedPhone;
				result = readyPhone;
			};

		return result;

			
	};


   	}]);