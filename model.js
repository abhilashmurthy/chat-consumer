var NonEmptyString = Match.Where(function(x) {
	check(x, String);
	return x.length !== 0;
});

var ConvertedNumber = Match.Where(function(x) {
	check(x, String);
	return parseInt(x) !== NaN;
});

if (Meteor.isServer) {

	//Server HTTP methods
	HTTP.methods({
		'users': function() {
			var users = Meteor.users.find({}).fetch();
			return JSON.stringify(users);
		},
		'user/:username': function(){
			var user = Meteor.users.findOne({"services.facebook.username": this.params.username});
			return JSON.stringify(user);
		},
	    'list': function() {
	      return '<b>Default content type is text/html</b>';
	    },
	    'push/test': {
	    	get: function() {
		      console.log('GET');
		      var sqbrackChallenge = this.query["hub.challenge"];
		      console.log('Square bracket challenge: ' + sqbrackChallenge);
		      //TODO: Implement verification
		      return sqbrackChallenge;
	    	},
	    	post: function(data) {
		      console.log('POST');
		      console.log(data);
		    }
	    }
	});

	//Server Meteor methods
	Meteor.methods({
		createUser: function(user) {
			console.log('Trying to create');
	        Meteor.users.update(user.id, {
	            fbId: user.services.facebook.id,
	            fbName: user.services.facebook.name,
	            fbUsername: user.services.facebook.username
	        });
		},
		getInbox: function(user) {
			var fbId = user.services.facebook.id;
			var fbAccessToken = user.services.facebook.accessToken;
			var result = null;
			try {
				result = HTTP.get(
					"https://graph.facebook.com/" + fbId + "/inbox",
					{"params": {"access_token": fbAccessToken}}
				);
				var result_data = result.data ? result.data.data : null;
				console.log("Results found: ");
				console.log(result_data.length);
				if (!result_data) return false;
			} catch (e) {
				console.log("Error!");
				console.log(JSON.stringify(e));
				return false;
			}
			return result_data;
		},
		getSubscriptions: function() {
			var appId = Meteor.settings.fb.appId;
			var access_token = Meteor.settings.fb.appId + "|" + Meteor.settings.fb.secret;
			var result = null;
			try {
				result = HTTP.get(
					"https://graph.facebook.com/v2.2/" + appId + "/subscriptions",
					{"params": {"access_token": access_token}}
				);
				console.log("Results found: ");
				console.log(result);
				if (!result) return false;
			} catch (e) {
				console.log("Error!");
				console.log(JSON.stringify(e));
				return false;
			}
			return result;
		},
		addSubscription: function() {
			var appId = Meteor.settings.fb.appId;
			var access_token = Meteor.settings.fb.appId + "|" + Meteor.settings.fb.secret;
			var object = 'user';
			var callback_url = 'http://chat-consumer.meteor.com/push/test';
			var fields = 'likes';
			var verify_token = 'abhilashverifies';
			var result = null;
			try {
				result = HTTP.post(
					"https://graph.facebook.com/v2.2/" + appId + "/subscriptions",
					{
						"params": {"access_token": access_token},
						"data": {
							"object": object,
							"callback_url": callback_url,
							"fields": fields,
							"verify_token": verify_token
						}
					}
				);
				console.log("Result: ");
				console.log(result);
				if (!result) return false;
			} catch (e) {
				console.log("Error!");
				console.log(JSON.stringify(e));
				return false;
			}
			return result;
		},
		deleteSubscription: function() {
			var appId = Meteor.settings.fb.appId;
			var access_token = Meteor.settings.fb.appId + "|" + Meteor.settings.fb.secret;
			var object = 'user';
			var result = null;
			try {
				result = HTTP.del(
					"https://graph.facebook.com/v2.2/" + appId + "/subscriptions",
					{
						"params": {"access_token": access_token},
						"data": {
							"object": object
						}
					}
				);
				console.log("Result: ");
				console.log(result);
				if (!result) return false;
			} catch (e) {
				console.log("Error!");
				console.log(JSON.stringify(e));
				return false;
			}
			return result;
		}
	});

}