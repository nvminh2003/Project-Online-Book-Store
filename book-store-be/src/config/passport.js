const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Account = require('../models/accountModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:9999/api/accounts/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await Account.findOne({ googleId: profile.id });
            if (!user) {
                user = await Account.create({
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    role: 'customer',
                    customerInfo: { fullName: profile.displayName }
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }
));

module.exports = passport;