var NonEmptyString = Match.Where(function(x) {
	check(x, String);
	return x.length !== 0;
});

var ConvertedNumber = Match.Where(function(x) {
	check(x, String);
	return parseInt(x) !== NaN;
});

var nodeLimit = 0;

Meteor.methods({
	createUser: function(user) {
		console.log('Trying to create');
		if (Meteor.isServer) {
	        Meteor.users.update(user.id, {
	            fbId: user.services.facebook.id,
	            fbName: user.services.facebook.name,
	            fbUsername: user.services.facebook.username
	        });
		}
	},
	getInbox: function(user) {
		if (Meteor.isServer) {
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
		}
	}
});