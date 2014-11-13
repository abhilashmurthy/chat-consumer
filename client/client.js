Meteor.subscribe("users");

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
	'click #getInboxBtn': function(e) {
		Meteor.call('getInbox', Meteor.user(), function(err, messages){
			console.log('Success!');
			Session.set('messages', messages);
		});
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
	return Session.get('messages');
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