angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})


.controller('SrcCtrl', function($scope,$ionicLoading,$http,$state)
{
	$scope.cleansearch=true;
	$scope.booknum=0;
	$scope.books="";
	$scope.showerror=false;
	$scope.curbook=0;
		
	$scope.search = function(srcVal)
	{
		$scope.cleansearch=true;
		$scope.searchTerm=srcVal;
		$scope.curpage=0;
		if($scope.searchTerm!=null)
		{ 
			//Look busy, go look for books, get results, show a book.
			//If I had multiple calls here I might have made a service for it.
			$ionicLoading.show({});
			$http.get("/search/index.xml?key=53oI5KopB4RKATbtCx1g9g&q="+$scope.searchTerm)
			.success(function(data, status, headers,config)
			{
				console.log('data success');
				var x2js = new X2JS();
				jsonObj = x2js.xml_str2json( data );
				console.log(jsonObj.GoodreadsResponse.search["results-end"]);
				console.log(parseInt(jsonObj.GoodreadsResponse.search["results-end"]));
				$scope.books=jsonObj.GoodreadsResponse.search.results.work;
				$scope.booknum=parseInt(jsonObj.GoodreadsResponse.search["results-end"])-1;
				console.log($scope.books);
				
				if ($scope.booknum==0)
				{
					$scope.cleansearch=false;
					$scope.showerror=true;
				}
				else
				{
					$scope.showbook(0);
					$scope.showerror=false;
					$scope.cleansearch=false;			
				}			
			})
			.error(function(data, status, headers,config)
			{
				console.log('data error');
			});
			$ionicLoading.hide().then(function()
			{
					console.log("The loading indicator is now hidden");
			});
		}	
		
	}
	
	$scope.showbook=function(thebook)
	{
		$scope.smallimgURL=$scope.books[thebook].best_book.small_image_url;
		$scope.title=$scope.books[thebook].best_book.title;
		$scope.avgrating=parseFloat($scope.books[thebook].average_rating); //This data is sometimes dirty.
		$scope.curbook=thebook;
		console.log("Curbook<booknum"+$scope.curbook+","+$scope.booknum);
	
	}
})
//DC: There were no descriptions to be had.  I've skipped getting them.  There were a few tidbits with publication dates and an author name, but I've left that untouched for now.
		
//		dater=:$scope.books[thebook].original_publication_year+
//			?($scope.books[thebook].original_publication_month!=null)?"-"+$scope.books[thebook].original_publication_month:"-??"+
//			?($scope.books[thebook].original_publication_day!=null)?+"-"+$scope.books[thebook].original_publication_day:"";
//		$rootScope.details={"pubinfo":dater,"author":$scope.books[thebook].author.name,}

.controller('EventsCtrl', function($scope, ionicDatePicker, $ionicLoading, $http)
{
	
	today=new Date().setHours(0,0,0,0);

	$scope.startdate=today;
	$scope.enddate=today;		
	$scope.startString="Set Start Date"
	$scope.endString="Set End Date"
	$scope.showresults=false;
	$scope.noevents=true;
	
	$scope.event="";
	
	var ipObj1 =
	{
    	callback: function (val) {  //Mandatory
        	console.log('Start Return value from the datepicker popup is : ' + val, new Date(val));
			$scope.startdate=val;
		}
    };

	var ipObj2 =
	{
    	callback: function (val) {  //Mandatory
        	console.log('End Return value from the datepicker popup is : ' + val, new Date(val));
			$scope.enddate=val;
		}
    };
	
	$scope.start=function()
	{
		ionicDatePicker.openDatePicker(ipObj1);
	}
	
	$scope.finish=function()
	{
		ionicDatePicker.openDatePicker(ipObj2);
	}
	
	$scope.search=function()
	{
		$scope.showresults=false;
		$ionicLoading.show({});
		$scope.finalArray=[];
		$http.get("/event/index.xml?key=53oI5KopB4RKATbtCx1g9g&search[country_code]=CA")
		.success(function(data, status, headers,config)
		{
			console.log('data success');
			var x2js = new X2JS();
			jsonObj = x2js.xml_str2json( data );
			$scope.event=jsonObj.GoodreadsResponse.events.event;
			console.log($scope.event);
			
			for (i=0;i<$scope.event.length;i++)
			{
				eventtimer=Date.parse($scope.event[i].start_at.__text.substring(0,10));
				if (eventtimer >= $scope.startdate && eventtimer <= $scope.enddate)
				{
					$scope.finalArray.push($scope.event[i]);
				}
			}
			$scope.maxevents=$scope.finalArray.length;
			if ($scope.maxevents==0)
			{	
				$scope.noevents=true;
				$scope.showresults=true;
			}
			else
			{
				$scope.noevents=false;
				$scope.showresults=true;
				$scope.showevent(0);
			}
		})
		.error(function(data, status, headers,config)
		{
			console.log('data error');
		});
		$ionicLoading.hide().then(function()
		{
			console.log("The loading indicator is now hidden");
		});
	}
	
	$scope.showevent = function(theevent)
	{
		e=Date.parse($scope.event[theevent].start_at.__text.substring(0,10));
		$scope.curevent=theevent;
		$scope.title=$scope.finalArray[theevent].title;
		$scope.address=$scope.finalArray[theevent].address;
		$scope.city=$scope.finalArray[theevent].city;
		$scope.date=$scope.finalArray[theevent].start_at.__text.substring(0,10);
	}
	
})