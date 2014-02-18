var BART_SERVICE_STATION_URL = "http://bartseek.com:4567/bart/stations";
var BART_SERVICE_REAL_TIME_URL = "http://bartseek.com:4567/bart/realtime";

var App = angular.module('App', ['ngRoute', 'geolocation']);

App.config(function($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

App.factory('bartEvents', function($http) {
  return {
    get: function(station, callback) {
      $http({
        url: BART_SERVICE_REAL_TIME_URL,
        params: {station: station},
        method: "GET"
      }).success(callback);
    }
  }
});

App.factory('bartStations', function($http) {
  return {
    get: function(callback) {
      $http({
        url: BART_SERVICE_STATION_URL,
        method: "GET"
      }).success(callback);
    }
  }
});

App.controller('bartSchedule', ['$scope', '$http', 'bartStations', 'bartEvents', 'geolocation', function($scope, $http, bartStations, bartEvents, geolocation) {

  $scope.getPosition = geolocation.getLocation().then(function(data){
    $scope.position = { latitude : data.coords.latitude, longitude : data.coords.longitude};
  });

  $scope.getNearestBart = function() {
    var smallestDistance = 0, smallestDistanceIndex = 0;
    for (var i = 0; i < $scope.stations.length; i++) {
      distance = getDistance($scope.stations[i].gtfs_latitude,
                             $scope.stations[i].gtfs_longitude,
                             $scope.position.latitude,
                             $scope.position.longitude)
      $scope.stations[i].distance = distance;
      if (smallestDistance === 0) {
        smallestDistance = distance;
      } else {
        if (distance < smallestDistance) {
          smallestDistance = distance;
          smallestDistanceIndex = i;
       }
      }
    }

    $scope.selectedBart = $scope.stations[smallestDistanceIndex];
    $scope.curSelect = $scope.selectedBart.abbr;
  };
 
  $scope.loadStations = function() {
    bartStations.get(function(result) {
      $scope.stations = result.root.stations.station;
    });
  }

  $scope.selectNewStation = function(value) {
    $scope.selectedBart = searchObj(value, $scope.stations)
  }

  $scope.$watch('stations', function(newValue, oldValue) {
    
  });

  $scope.$watch('position', function(newValue, oldValue) {
    // if ($scope.stations !== undefined) 
      $scope.getNearestBart();
  });

  $scope.$watch('selectedBart', function(newValue, oldValue) {
    if ($scope.selectedBart !== undefined) {
      bartEvents.get($scope.selectedBart.abbr, function(result) {
        $scope.nearbyEvents = result.root.station.etd;
      });
    }
  });

  $scope.loadStations();

}]);


// Utilities

function searchObj(nameKey, myObj){
    for (var i = 0; i < myObj.length; i++) {
        if (myObj[i].abbr === nameKey) {
            return myObj[i];
        }
    }
}

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

// borrowed from http://www.movable-type.co.uk/scripts/latlong.html
function getDistance(lat1, lon1, lat2, lon2) {
  
  for (var i = 0; i < arguments.length; i++) {
    if (typeof(arguments[i] != 'Number')) {
      arguments[i] = parseFloat(arguments[i]);
    }
  }

  var R = 6371; // earth's radius in km
  var dLat = (lat2-lat1).toRad();
  var dLon = (lon2-lon1).toRad();
  var lat1 = (lat1).toRad();
  var lat2 = (lat2).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

angular.element(document).ready(function() {
  angular.bootstrap(document, ['App']);
});
