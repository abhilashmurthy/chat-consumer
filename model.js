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
		Meteor.users.update(user.id, {
			fbId: user.services.facebook.id,
			fbName: user.services.facebook.name,
			fbUsername: user.services.facebook.username
		});
	}
});