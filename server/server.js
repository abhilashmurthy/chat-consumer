//Publish all users
Meteor.publish("users", function() {
	return Meteor.users.find({});
});

//Publish all likes
Meteor.publish("likes", function() {
	return Likes.find({});
});

//Publish all messages
Meteor.publish("messages", function(){
	return Messages.find({userId: this.userId});
})

Meteor.startup(function() {
});

