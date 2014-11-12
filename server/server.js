//Publish all users
Meteor.publish("users", function() {
	return Meteor.users.find({});
});

Meteor.startup(function() {
});