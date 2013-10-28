"use strict";

/* Controllers */

Date.prototype.toString = function(){
	return this.getFullYear()+'年'+(this.getMonth()+1)+'月'+
		this.getDate()+'日 '+this.getHours()+':'+this.getMinutes();
};

var loverControllers = angular.module('loverControllers', []);

loverControllers.controller('loverMsgCtrl', ['$scope', '$location', '$rootScope', '$http',
	function($scope, $location, $rootScope, $http){

	$rootScope.rootActionText = "退出";
	$rootScope.rootActionLink = '';
/*
	//$scope.user_id;
	//$scope.userName
  $http.post('/getloginuser').success(function(data, status, headers, config) {
    $scope.user_id  = data.user_id;
    $scope.userName = data.userName;
	}).error(function(data, status, headers, config){
		alert(res.data);
		$location.path('/login');
	});


	$scope.msg_list = LoverMsg.query(function(){
		var da;
		for (var i = 0; i < $scope.msg_list.length; i++){
			da = new Date($scope.msg_list[i].time);
      //$scope.msg_list[i].timeString = da.toString();
		}
	}, function(res){
		alert(res.data.error);
		$location.path('/login');

	});

	$scope.createMsg = function() {
		var msg = new LoverMsg();
		msg.message = $scope.inText;
		msg.time = new Date();
		msg.user_id = $scope.user_id;
		msg.$save({}, {}, function(res){
      alert(res.data.message);
    });

		msg.timeString = msg.time.toString();
		//alert(msg.timeString);
      $scope.msg_list.unshift(msg);
    };

    $scope.delMsg = function(msg) {
      msg.$delete();
      $scope.msg_list.pop();
    };
*/
}]);

loverControllers.controller('loverLoginCtrl', ['$scope', '$http', '$location', '$rootScope',
function($scope, $http, $location, $rootScope){

	$rootScope.rootActionText = "注册";
	$rootScope.rootActionLink = '#/register';
/*
	$scope.postLogin = function(username, password){
		var postData = {username: username, password: password};
		$http.post('/login', postData).success(function(data, status, headers, config) {
			$rootScope.rootUsername = username;
        $location.path('/main');
      }).error(function(data, status, headers, config){
        $scope.postRsp = data.error;
        //$location.path('/app');
      });
	};
*/
}]);

loverControllers.controller('loverRegisterCtrl', ['$scope', '$http', '$rootScope',
function($scope, $http, $rootScope){

	$rootScope.rootActionText = "登录";
	$rootScope.rootActionLink = '#/login';

	$scope.postRegister = function(username, password){
		var dataPost = {username: username, password: password};
		$http.post('/register', dataPost).success(function(data, status, headers, config) {
      if (data.code === true){
        //$location.path('/main');
        $scope.postRsp = "register success";
      }
      else{
        $scope.postRsp = data.data;
      }
    });
	};
}]);

loverControllers.controller('loverIndexCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope){

	$rootScope.rootActionText = "登录";
	$rootScope.rootActionLink = '#/login';

}]);


