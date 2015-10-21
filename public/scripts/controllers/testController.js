'use strict';

var snapwattApp = angular.module('snapwattApp');

snapwattApp.controller('testCtrl', 
   	['$scope', '$timeout', '$routeParams', '$location', '$window', 'growl',
   	function ($scope, $timeout, $routeParams, $location, $window, growl) {
   		var currentUser = Parse.User.current();
 		// just pull the carmel street location for testing  		
   		var locationID = "aAUWH2yaWw";

   		var Locations = Parse.Object.extend("Locations");
		var query = new Parse.Query(Locations);
		query.equalTo("objectId", locationID);
		query.find({
		  success: function(locations) {
		  	console.log(locations);
		  	getReadings(locations[0]);
		    $scope.$apply();
		  },
		  error: function(object, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		  }
		});

// pull the readings

 // $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];

 //  $scope.data = [
 //    [65, 59, 80, 81, 56, 55, 40]
 //  ];


  $scope.labels = [];
  $scope.data = [];
  $scope.options = {scaleOverride: true};
  var series1 = [];
  var kwhCost

function getReadings (loc) {
			$scope.processedReadings = [];
			kwhCost = loc.get('elec_cost');

			var MeterRead = Parse.Object.extend("Meter_Readings");
			var query = new Parse.Query(MeterRead);
			query.equalTo("location", loc);
			query.limit(10);
			query.descending("createdAt");
			query.find({
			  success: function(results) {
			  	createGraph(results);
			    
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});

		};

		function highLowOfArray(actual, func){
			  var newArray = new Array();
			  for(var i = 0; i<actual.length; i++){
			      if (actual[i]){
			        newArray.push(actual[i]);
			    }
			  }

			  if (func == "low") {
			  	newArray.sort(function (a,b){return a-b});
			  	
			  };

			  if (func == "high") {
			  	
			  	newArray.sort(function(a, b){return b-a});
			  };
			  


			  return newArray[0];
			};

				
		
			function daysInMonth(month,year) {
			    return new Date(year, month +1, 0).getDate();
			};


	function createGraph (results) {
		var prevDate;
			    for (var i = 0; i <= results.length-1; i++) {
			    	var dCost = (results[i].get('kwh_per_day') * kwhCost).toFixed(2);
			    	var mCost = (results[i].get('kwh_per_month') * kwhCost).toFixed(0);
			    	var multiple = results[i].get('multiple_from_prev');
			    	var reading = results[i].get('kwh_read');
			    	var percentage;
			    	var direction;
			    	var currentDate = results[i].createdAt;
			    	var readingDate = processDate(currentDate);

			    	if (prevDate) {
			    		if (prevDate.getMonth() == currentDate.getMonth()) {
			    			if (currentDate.getDate() - prevDate.getDate() <= -2 ) {
			    				//check if there are missing days within a month
			    				$scope.labels.push('');
			    				series1.push('');
			    			};			    				
			    		} if (prevDate.getMonth() != currentDate.getMonth()) {
			    			// check if there are missing days that span over 2 different months

			    			var dayCurrent = currentDate.getDate();
			    			console.log('day current ' + dayCurrent);
			    			var dayPrev = prevDate.getDate();
			    			console.log('day previous ' + dayPrev);
			    			var daysPrevMonth = daysInMonth(currentDate.getMonth(), prevDate.getYear());

			    			console.log("days of previous " + daysPrevMonth);
			    			
			    			var totalDaysDiff = (daysPrevMonth - dayCurrent) + dayPrev -1;
			    			console.log(totalDaysDiff);
			    			for (var y = totalDaysDiff - 1; y >= 0; y--) {
			    				$scope.labels.push('');
			    				series1.push('');
			    			};



			    		};
			    	} else{

			    	};
			    	

			    	if (multiple >= 1) {
		                  percentage = ((multiple -1) * 100).toFixed(0);
		                  direction = "up";
		                 } else {
		                  percentage = ((1 - multiple) * 100).toFixed(0);
		                  direction = "down";
		                };

		            $scope.labels.push(readingDate);
		            series1.push(reading);
			    		    	
			    				
			    	if (i == results.length - 1) {
			    		$scope.labels = $scope.labels.reverse();
			    		$scope.data[0] = series1.reverse();
			    		var sortable = $scope.data[0];

			    		var lowest = highLowOfArray(sortable, "low");
			    		var highest = highLowOfArray(sortable, "high");
			    		
			    		var step = 25;
			    		var min = Math.floor((lowest * .999)/step)*step;
			    		var max = Math.ceil((highest * 1.001)/step)*step;
			    		
			    		console.log(min);
			    		console.log(max);


			    		$scope.options.scaleSteps = Math.ceil((max-min)/step);
			    		$scope.options.scaleStepWidth = step;
			    		$scope.options.scaleStartValue = min;
			    		$scope.$apply();
			    		console.log('tried to apply scope');
			    	};
			    	prevDate = results[i].createdAt;
			    };
	};



		function processDate(myDate){
    	var readableDate = myDate.getMonth() + 1 + "/" + myDate.getDate() + "/" + myDate.getFullYear();
    	return readableDate;
    };

    	$scope.set_color = function (reading) {
    		var font;
    		if (reading.changeDirection == "up") {
    			font = {color: "red"}
    		};
    		if (reading.changeDirection == "down") {
    			font = {color: "green"}
    		};
    		return font;
    	};



 









   	}]);