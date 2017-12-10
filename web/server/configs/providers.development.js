var clientID = process.env.TEST_TWITCH_CLIENT_ID;
var clientSecret = process.env.TEST_TWITCH_CLIENT_SECRET;

module.exports = {
    'twitch-login': {
        provider: 'twitch',
        module: 'passport-twitch',
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: 'http://localhost:3000/login/twitch/callback',
        authPath: '/login/twitch',
        callbackPath: '/login/twitch/callback',
        successRedirect: '/games',
        failureRedirect: '/',
        scope: ['user_read']
    }
};