Meteor.subscribe("users");
Meteor.subscribe("likes");
Meteor.subscribe("messages");

//////////////////////////////////////////////////////////////////////////////////////////////////////////// DEFAULTS
Template.navbar.events = {
	'click .login-display-name': function(e) {
		window.open(Meteor.user().services.facebook.link, '_blank');
	}
}

Template.user_loggedout.events({
	'click #login': function(e) {
		$('.login2').show();
		Meteor.loginWithFacebook({
			requestPermissions: Meteor.settings.public.fb.permissions
		}, function(err) {
			if (err) console.log(err);
			else console.log('Logged in!');
		});
	}
});

Template.user_loggedin.events({
	'click #logout': function(e) {
		Meteor.logout(function(err) {
			if (err) console.log(err);
		});
	}
});

//////////////////////////////////////////////////////////////////////////////////////////////// PAGE
Template.page.events = {
	'click #startListeningBtn': function(e) {
		//Poll every 2 seconds
		var interval = 2;
		var intervalId = Meteor.setInterval(function(){
			Meteor.call('monitorInbox', Meteor.user(), interval);
		}, 2 * 1000);
		Session.set('intervalId', intervalId);
	},
	'click #stopListeningBtn': function(e) {
		var intervalId = Session.get('intervalId');
		Meteor.clearInterval(intervalId);
		Session.set('intervalId', null);
	},
	'click #pushTestBtn': function(e) {
		HTTP.post('push/test', {
			data: { foo: 'bar' }
		}, function(err, result) {
			console.log('Content: ' + result.content + ' === "Hello"');
		});
	}
}

Template.subscriptions.events = {
	'click #getSubscriptionsBtn': function(e) {
		Meteor.call('getSubscriptions', function(err, subscriptions){
			console.log('Subscriptions!');
			console.log(subscriptions);
		});
	},
	'click #addSubscriptionBtn': function(e) {
		Meteor.call('addSubscription', function(err, result){
			console.log('Added: ');
			console.log(result);
		});
	},
	'click #deleteSubscriptionBtn': function(e) {
		Meteor.call('deleteSubscription', function(err, result){
			console.log('Deleted: ');
			console.log(result);
		});
	}
}

Template.messages.messages = function(){
	return Messages.find({});
}

Template.messages.intervalId = function(){
	return Session.get('intervalId');
}

Template.likes.likes = function(){
	return Likes.find({});
}

//////////////////////////////////////////////////////////////////////////////////////////////// PLUGINS
//Pnotify settings
$.pnotify.defaults.history = false;
$.pnotify.defaults.delay = 3000;

function notify(title, message) {
	$.pnotify({
		title: title,
		text: message,
		type: "warning",
		icon: false,
		sticker: false,
		mouse_reset: false,
		animation: "fade",
		animate_speed: "fast",
		before_open: function(pnotify) {
			pnotify.css({
				top: "52px",
				left: ($(window).width() / 2) - (pnotify.width() / 2)
			});
		}
	});
}