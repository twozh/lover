"use strict";

Date.prototype.toString = function(){
  return this.getFullYear()+'年'+(this.getMonth()+1)+'月'+
    this.getDate()+'日 '+this.getHours()+':'+this.getMinutes();
 };

Array.prototype.delById = function(id){
  for (var i=0; i < this.length; i++){
    if (id === this[i]._id){
      this.splice(i, 1);
    }
  }
};

/* Controllers */

var loverControllers = angular.module('loverControllers', []);

loverControllers.controller('loverMsgCtrl', ['$scope', '$location', '$rootScope', '$http',
	function($scope, $location, $rootScope, $http){

	$rootScope.rootActionText = "退出";
	$rootScope.rootActionLink = '';

  //check if user had logged in
  $http.post('/getloginuser').success(function(data, status, headers, config) {
    if (data.code === true){
      $scope.user_id  = data.data._id;
      $scope.userName = data.data.name;
    } else {
      $location.path('/login');
    }
	});

  //get msg list first time
  $http.get('/msgs').success(function(ret){
    $scope.msgList = ret.data;
  });

	$scope.createMsg = function(inText) {
    var postText     = {};
    postText.message = inText;
    postText.user_id = $scope.user_id;

    $http.post('/msgs', postText).success(function(data, status, headers, config) {
      $scope.msgList.unshift(data.data);
    });
  };

  $scope.delMsg = function(msg){
    $http.delete('/msgs/' + msg._id).success(function(ret){
      $scope.msgList.delById(msg._id);
    });
  };

}]);

loverControllers.controller('loverLoginCtrl', ['$scope', '$http', '$location', '$rootScope',
function($scope, $http, $location, $rootScope){

	$rootScope.rootActionText = "注册";
	$rootScope.rootActionLink = '#/signup';

	$scope.postLogin = function(username, password){
		var postData = {name: username, password: password};
		$http.post('/login', postData).success(function(data, status, headers, config) {
			$rootScope.rootUsername = username;
      $location.path('/main');
    });
	};

}]);

loverControllers.controller('loverRegisterCtrl', ['$scope', '$http', '$rootScope', '$location',
function($scope, $http, $rootScope, $location){

	$rootScope.rootActionText = "登录";
	$rootScope.rootActionLink = '#/login';

	$scope.postRegister = function(username, password){
		var dataPost = {username: username, password: password};
		$http.post('/register', dataPost).success(function(data, status, headers, config) {
      if (data.code === true){
        $location.path('/login');
      }
      else{
        $scope.postRsp = data.data;
      }
    });
	};
}]);

loverControllers.controller('loverIndexCtrl', ['$scope', '$http', '$rootScope',
function($scope, $http, $rootScope){

	$rootScope.rootActionText = "登录";
	$rootScope.rootActionLink = '#/login';
}]);


