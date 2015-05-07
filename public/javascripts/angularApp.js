var app = angular.module('Hypnotoad', []);

app.directive('enterSubmit', function () {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {

			elem.bind('keydown', function(event) {
			var code = event.keyCode || event.which;

				if (code === 13) {
					if (!event.shiftKey) {
						event.preventDefault();
						scope.$apply(attrs.enterSubmit);
					}
				}
			});
		}
	}
});

app.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	auth.saveToken = function (token){
		$window.localStorage['hypnotoad-token'] = token;
	};

	auth.getToken = function (){
		return $window.localStorage['hypnotoad-token'];
	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			return true;
		} else {
		return false;
		}
	};

	auth.currentUser = function (){
		var token = auth.getToken();
		return token;
	};

	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.username);
		});
	};

	auth.logOut = function(){
		$window.localStorage.removeItem('hypnotoad-token');
	};

	return auth;
}]);

app.factory('posts', ['$http', function($http){
	var o = {
		posts: []
	};

	o.getAll = function() {
		return $http.get('/posts').success(function(data){
			angular.copy(data, o.posts);
		});
	};

	o.create = function(post) {
		return $http.post('/posts', post).success(function(data){
			o.posts.push(data);
		});
	};

	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote')
		.success(function(data){
			post.upvotes += 1;
		});
	};

	o.deletepost = function(post) {
		return $http.put('/posts/' + post._id + '/remove')
		.success(function(data){
			return true;
		});
	};

	return o;
}]);

app.controller('MainCtrl', [
'$scope',
'posts',
'auth',
function($scope, posts, auth){

	$scope.posts = posts.posts;
	posts.getAll();
	$scope.date = Date.now();
	$scope.user = {}

	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser();

	$scope.addPost = function(){
		if(!$scope.message || $scope.message === '') { return; }
		
		var sender = "anon";
		if($scope.currentUser != "" && $scope.currentUser){ 
			sender = $scope.currentUser
		}

		posts.create({
			message: $scope.message,
			upvotes: 0,
			timestamp: Date.now(),
			user: sender
		}).success(posts.getAll());
		$scope.message = '';
	};

	$scope.incrementUpvotes = function(post) {
		posts.upvote(post);
	};

	$scope.deletePost = function(post) {
		posts.deletepost(post).success(function(data){
			$scope.posts.splice($scope.posts.indexOf(post), 1);
		});
	};

	$scope.logIn = function(){
		auth.logIn($scope.user).error(function(error){
			$scope.error = error;
		}).then(function(data){
			$scope.currentUser = auth.currentUser();
		});
		$scope.user = '';
		$scope.password = '';
	};

	$scope.logOut = function(){
		auth.logOut();
		isLoggedIn = false;
		$scope.currentUser = "";
	};

}]);
