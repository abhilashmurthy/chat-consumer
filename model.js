Likes = new Meteor.Collection("likes");
Messages = new Meteor.Collection("messages");

var NonEmptyString = Match.Where(function(x) {
	check(x, String);
	return x.length !== 0;
});

var ConvertedNumber = Match.Where(function(x) {
	check(x, String);
	return parseInt(x) !== NaN;
});

if (Meteor.isServer) {
	var Telepathy = DDP.connect("http://telepathy.meteor.com");
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
	    'push/fb': {
	    	get: function() {
		      console.log('GET');
		      var hubChallenge = this.query["hub.challenge"];
		      //TODO: Implement verification
		      return hubChallenge;
	    	},
	    	post: function(data) {
		      console.log('POST');
		      Meteor.call('findNewLike', data, function(err, result){
		      	if (err) {
		      		console.log('ERROR');
		      		console.log(err);
		      	}
		      	console.log(result);
		      });
		    }
	    }
	});

	//Server Meteor methods
	Meteor.methods({
		monitorInbox: function(user, interval) {
			var fbId = user.services.facebook.id;
			var fbAccessToken = user.services.facebook.accessToken;
			var result = null;

			try {
				result = HTTP.get(
					"https://graph.facebook.com/" + fbId + "/inbox?limit=1",
					{"params": {"access_token": fbAccessToken}}
				);
				var result_data = result.data ? result.data.data : null;
				for (var i = 0; i < result_data.length; i++) {
					var thread = result_data[i];
					var comments = thread.comments.data;
					var lastComment = comments[comments.length - 1];

					var currentDate = new Date();
					var commentDate = new Date(moment(lastComment.created_time).format());
					// console.log('Current date: ' + currentDate);
					// console.log('Comment date: ' + commentDate);
					var secondDiff = Math.round((currentDate - commentDate)/1000);
					if (secondDiff <= interval) {
						var newMessage = {
							userId: user._id,
							user_fbId: fbId,
							message: lastComment
						};
						var storedMessage = Messages.findOne(newMessage);
						if (!storedMessage) {
							console.log('Adding new message');
							console.log(lastComment);

							Telepathy.call('message', newMessage.message.message);
							Messages.insert(newMessage);
						}
					}
				}
			} catch (e) {
				console.log("Error!");
				console.log(JSON.stringify(e));
				return false;
			}
			return true;
		},
		getSubscriptions: function() {
			console.log('GETTING SUBSCRIPTIONS');
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
			console.log('ADDING SUBSCRIPTION');
			var appId = Meteor.settings.fb.appId;
			var access_token = Meteor.settings.fb.appId + "|" + Meteor.settings.fb.secret;
			var object = 'user';
			var callback_url = Meteor.settings.fb_subscriptions.callback_url;
			var fields = Meteor.settings.fb_subscriptions.fields;
			var verify_token = Meteor.settings.fb_subscriptions.verify_token;
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
			console.log('DELETING SUBSCRIPTION');
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
		},
		findNewLike: function(data) {
			console.log('FINDING NEW LIKE: ');
			console.log(data.entry);

			//Get unique changed ids
			var changedIds = [];
			for (var i = 0; i < data.entry.length; i++) {
				var entry = data.entry[i];
				if (changedIds.indexOf(entry.id) < 0) {
					changedIds.push(entry.id);
				}
			}

			//Get new likes of each id
			var access_token = Meteor.settings.fb.appId + "|" + Meteor.settings.fb.secret;
			for (var i = 0; i < changedIds.length; i++) {
				try {
					result = HTTP.del(
						"https://graph.facebook.com/v2.2/" + changedIds[i] + "/likes",
						{
							"params": {"access_token": access_token},
						}
					);
					var resultData = result.data ? result.data.data : null;
					if (!resultData) return false;
					console.log('ADDING NEW LIKE');
					console.log(resultData[0]);
					Likes.insert({
						userId: changedIds[i],
						like: resultData[0]
					});
					return true;
				} catch (e) {
					console.log("Error!");
					console.log(JSON.stringify(e));
					return false;
				}
			}
		}
	});

}