"use strict";

Array.prototype.delById = function(id){
  for (var i=0; i < this.length; i++){
    if (id === this[i]._id){
      this.splice(i, 1);
    }
  }
};

/*
  the controllsers
 */
var loverControllers = angular.module('loverControllers', []);

/*
  main.html control
 */
loverControllers.controller('loverMsgCtrl', ['$scope', '$location', '$rootScope', '$http',
function($scope, $location, $rootScope, $http){

	$rootScope.rootActionText = "退出";
	$rootScope.rootActionLink = '#/logout';

  $scope.isNoRelation = false;
  $scope.isAdding = false;
  $scope.isInRelation = false;

  $http.get('/msgs').success(function(ret){
    alert(ret.code);

    if (ret.code === "NOT-LOGIN"){
      $location.path('/login');
    } else if (ret.code === "NO-RELATION"){
      $scope.isNoRelation = true;
    } else if (ret.code === "ADDING"){
      $scope.isAdding = true;
    } else {
      $scope.isInRelation = true;
    }


  });

	$scope.createMsg = function(inText) {
    var postText     = {};
    postText.message = inText;
    postText.user_id = $scope.user_id;

    $http.post('/msgs', postText).success(function(data, status, headers, config) {
      var idTmp = data.data.user_id;
      data.data.user_id = {};
      data.data.user_id.name = $scope.userName;
      data.data.user_id._id = idTmp;
      $scope.msgList.unshift(data.data);

      //clear input textarea
      $scope.inText = '';
    });
  };

  $scope.delMsg = function(msg){
    //if msg's user is not the current logged in one, then return
    if ($scope.user_id !== msg.user_id._id){
      return;
    }

    $http.delete('/msgs/' + msg._id).success(function(ret){
      $scope.msgList.delById(msg._id);
    });
  };

  $scope.findTheOne = function(name){
    var postObj = {};
    postObj.code = "SEARCH-THE-ONE";
    postObj.data = name;
    $http.post('/app', postObj).success(function(data, status, headers, config) {
      $scope.addResult = data.code;

      if (data.code === "NO-RELATION"){
        $scope.showAddButton = true;
      }

    });
  };

}]);

/*
  login.html control
 */
loverControllers.controller('loverLoginCtrl', ['$scope', '$http', '$location', '$rootScope',
function($scope, $http, $location, $rootScope){

	$rootScope.rootActionText = "注册";
	$rootScope.rootActionLink = '#/signup';

	$scope.postLogin = function(username, password){
		var postData = {name: username, password: password};
		$http.post('/login', postData).success(function(data, status, headers, config) {
      if (data.code === true){
        $location.path('/main');
      } else {
        $scope.postRsp = data.data;
      }
    });
	};
}]);

/*
  logout control
 */
loverControllers.controller('loverLogoutCtrl', ['$http', '$location', function($http, $location){
  $http.post('/logout').success(function(data, status, headers, config) {
    if (true === data.code){
      //alert("welcom next time.");
      $location.path('/');
    }
  });
}]);

/*
  register.html control
 */
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

/*
  idx.html control
 */
loverControllers.controller('loverIndexCtrl', ['$scope', '$http', '$rootScope',
function($scope, $http, $rootScope){

	$rootScope.rootActionText = "登录";
	$rootScope.rootActionLink = '#/login';
}]);


