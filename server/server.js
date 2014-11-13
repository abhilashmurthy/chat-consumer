//Publish all users
Meteor.publish("users", function() {
	return Meteor.users.find({});
});

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
    }
});


Meteor.startup(function() {
});

