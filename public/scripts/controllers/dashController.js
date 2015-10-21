'use strict';

var snapwattApp = angular.module('snapwattApp');

snapwattApp.controller('DashCtrl', 
   	['$scope', '$timeout', '$routeParams', '$location', '$window', 'growl'
,   	function ($scope, $timeout, $routeParams, $location, $window, growl) {
   		var currentUser = Parse.User.current();
   		$scope.selLocation;
   		$scope.locationlist = [];
   		
   		var Locations = Parse.Object.extend("Locations");
		var query = new Parse.Query(Locations);
		query.equalTo("owner", currentUser);
		query.find({
		  success: function(locations) {
		  	for (var i = locations.length - 1; i >= 0; i--) {
		  		$scope.locationlist.push(locations[i])
		  	};
		    $scope.changeSelectedLocation(locations[0]);
		    console.log('here are the users locations');
		    console.log($scope.locationlist);
		    $scope.$apply();
		    addSharedLocations();
		  },
		  error: function(object, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		  }
		});

		function addSharedLocations (){
				var sharedQuery = new Parse.Query(Locations);
				sharedQuery.equalTo("sharedUsers", currentUser);

				sharedQuery.find({
				  success: function(results) {
				  	console.log('here are the shared locations');
				  	console.log(results);
				    for (var i = results.length - 1; i >= 0; i--) {
				  		$scope.locationlist.push(results[i]);
				  	};
				    $scope.$apply();
				  },
				  error: function(error) {
				    alert("Error: " + error.code + " " + error.message);
				  }
				});

		};
		


		$scope.changeSelectedLocation = function (loc) {

		console.log(loc);
		console.log('in function');
		$scope.selLocation = loc;
		getReadings(loc);
		$scope.labels = [];
		$scope.data = [];
	    $scope.options = {scaleOverride: true};
	    totalKWH = [];
	    sortable = [];
		lowest = "";
		highest = "";
		step = "";
		min = "";
		max = "";
	};

	//all variables need to be set

	var meter_read;
	var location;
	var prev_kwh_read;
	var prev_createdAt;
	var prev_kwh_per_day;
	var kwh_since_prev;
	var kwh_per_day;
	var kwh_per_month;
	var multiple_from_prev;



	$scope.saveMeterRead = function() {
		// from meter read
		meter_read = parseFloat($scope.meter_read);
		location = $scope.selLocation;


		
		// pull previous reading
		var MeterRead = Parse.Object.extend("Meter_Readings");
		var query = new Parse.Query(MeterRead);
		query.equalTo("location", location);
		query.descending("createdAt");
		query.limit(1);
		query.find({
		  success: function(reading) {
		  	console.log('here is the previous reading we got');
		  	console.log(reading[0].get('prev_kwh_read'));
		   	pushWithPrevious(reading[0]);
		  },
		  error: function(object, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		  }
		});

	};

	function pushWithPrevious (reading) {
			var MeterRead = Parse.Object.extend("Meter_Readings");
			var meter_read_object = new MeterRead();

			//from previous
			prev_kwh_read = reading.get('kwh_read');
			prev_createdAt = reading.createdAt;
			prev_kwh_per_day = reading.get('kwh_per_day');



			 
			meter_read_object.set("kwh_read", meter_read);
			meter_read_object.set("location", location);
			meter_read_object.set("prev_kwh_read", prev_kwh_read);
			meter_read_object.set("prev_createdAt", prev_createdAt);
			meter_read_object.set("prev_kwh_per_day", prev_kwh_per_day);

			 
			meter_read_object.save(null, {
			  success: function(meter_read_object) {
			    console.log('success');
			    calculateAndPush(meter_read_object);
			  },
			  error: function(meter_read_object, error) {
			   
			  }
			});
	};

	function calculateAndPush (obj) {
		var daysSincePrevious = (obj.createdAt - prev_createdAt) / 1000 / 60 / 60 / 24;
		console.log('time since previous is - ' + daysSincePrevious);


		//calculated
			kwh_since_prev = meter_read - prev_kwh_read;
			kwh_per_day = kwh_since_prev / daysSincePrevious;
			var kwh_per_day_form = parseFloat(kwh_per_day.toFixed(2));
			kwh_per_month = kwh_per_day * 30.4;
			var kwh_per_month_form = parseFloat(kwh_per_month.toFixed(2));
			multiple_from_prev = kwh_per_day / prev_kwh_per_day;
			var multiple_from_prev_form = parseFloat(multiple_from_prev.toFixed(4));


			console.log(kwh_since_prev);
			console.log(kwh_per_day);
			console.log(kwh_per_month);
			console.log(multiple_from_prev);

			var id = obj.id;
			var MeterRead = Parse.Object.extend("Meter_Readings");
			var query = new Parse.Query(MeterRead);
			query.get(id, {
			  success: function(read) {
			  	console.log('found this read');
			  	console.log(read);
			    	read.save(null, {
						success: function(read) {
							read.set("kwh_since_prev", kwh_since_prev);
							read.set("kwh_per_day", kwh_per_day_form);
							read.set("kwh_per_month", kwh_per_month_form);
							read.set("multiple_from_prev", multiple_from_prev_form);
							read.save();
							growl.addSuccessMessage("Saved!!!");
							$scope.changeSelectedLocation($scope.selLocation);

							
						}
					});
			  },
			  error: function(object, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and description.
			  }
			});


	};

		$scope.processedReadings = [];
		$scope.refreshReadings = function () {
			$scope.processedReadings = [];
			getReadings($scope.selLocation);
		};

		var kwhCost;
		function getReadings (loc) {
			$scope.labels = [];
			$scope.data = [];
		    $scope.options = {scaleOverride: true};
		    totalKWH = [];
		    sortable = [];
			lowest = "";
			highest = "";
			step = "";
			min = "";
			max = "";

			
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
			    for (var i = 0; i <= results.length - 1; i++) {
			    	var dCost = (results[i].get('kwh_per_day') * kwhCost).toFixed(2);
			    	var mCost = (results[i].get('kwh_per_month') * kwhCost).toFixed(0);
			    	var multiple = results[i].get('multiple_from_prev');
			    	var percentage;
			    	var direction;
			    	var readingDate = processDate(results[i].createdAt);

			    	if (multiple >= 1) {
		                  percentage = ((multiple -1) * 100).toFixed(0);
		                  direction = "up";
		                 } else {
		                  percentage = ((1 - multiple) * 100).toFixed(0);
		                  direction = "down";
		                };


			    	
			    	$scope.processedReadings[i] = {
			    	"createdAt" : readingDate, 
			    	"measured" : results[i].get('kwh_read'), 
			    	"dailyUse" : results[i].get('kwh_per_day'),
			    	"dailyCost" : "$" + dCost,
			    	"monthlyCost" : "$" + mCost,
			    	"change" : percentage + "%",
			    	"changeDirection": direction
			    }
			    	if (i == results.length - 1) {
			    		$scope.$apply();
			    		console.log('tried to apply scope');
			    	};
			    };
			    
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});

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

    	$scope.goToPage = function(path){
    	console.log(path);
		$location.path(path);
		
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


			$scope.labels = [];
   		    $scope.data = [];
		    $scope.options = {scaleOverride: true};
		    var totalKWH = [];
		    var sortable;
		    var lowest;
		    var highest;
		    var step;
		    var min;
		    var max;

	function createGraph (results) {
		var prevDate;
			    for (var i = 0; i <= results.length-1; i++) {
			    	var dCost = (results[i].get('kwh_per_day') * kwhCost).toFixed(2);
			    	var mCost = (results[i].get('kwh_per_month') * kwhCost).toFixed(0);
			    	var multiple = results[i].get('multiple_from_prev');
			    	var reading = results[i].get('kwh_read');
			    	var dailyUse = results[i].get('kwh_per_day');
			    	var percentage;
			    	var direction;
			    	var currentDate = results[i].createdAt;
			    	var readingDate = processDate(currentDate);

			    	if (prevDate) {
			    		if (prevDate.getMonth() == currentDate.getMonth()) {
			    			if (currentDate.getDate() - prevDate.getDate() <= -2 ) {
			    				//check if there are missing days within a month
			    				var firstDaysDiff = currentDate.getDate() - prevDate.getDate();

			    				console.log(firstDaysDiff);
			    				blankDays(-firstDaysDiff);
			    				
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
			    				totalKWH.push('');
			    			};



			    		};
			    	} else {

			    	};
			    	

			    	if (multiple >= 1) {
		                  percentage = ((multiple -1) * 100).toFixed(0);
		                  direction = "up";
		                 } else {
		                  percentage = ((1 - multiple) * 100).toFixed(0);
		                  direction = "down";
		                };

		            $scope.labels.push(readingDate);
		            totalKWH.push(dailyUse);
			    		    	
			    				
			    	if (i == results.length - 1) {
			    		$scope.labels = $scope.labels.reverse();
			    		$scope.data[0] = totalKWH.reverse();
			    		sortable = $scope.data[0];

			    		lowest = highLowOfArray(sortable, "low");
			    		highest = highLowOfArray(sortable, "high");
			    		
			    		step = 1.0;
			    		min = Math.floor((lowest * .90)/step)*step;
			    		max = Math.ceil((highest * 1.10)/step)*step;
			    		
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

	function blankDays (num){
		console.log('got to the function' +  num);
		for (var i = num - 2; i >= 0; i--) {
			$scope.labels.push('');
			totalKWH.push('');
		};
		
	};

	$scope.chart = true;
        $scope.chartToggle = function () {
            $scope.chart = $scope.chart === false ? true: false;
           

		    getReadings($scope.selLocation);
            console.log('changed the chart');
        };



   	}]);

