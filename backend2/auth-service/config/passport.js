// backend/auth-service/config/passport.js
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js'; // Path is now correct from auth-service/config to auth-service/models
import dotenv from 'dotenv';

// dotenv.config(); // No longer needed here if server.js in auth-service loads it first.
// Or, ensure server.js in auth-service loads dotenv before initializing passport.

export default function(passport) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
      console.error("AuthService PASSPORT FATAL ERROR: Google OAuth credentials or Callback URL missing. Check .env file.");
      return;
  }
  console.log('AuthService Passport: Google Strategy Initializing...');
  console.log('  Client ID:', process.env.GOOGLE_CLIENT_ID ? 'OK' : 'MISSING');
  // This callbackURL is what passport.js uses internally to match Google's redirect.
  // It should be the *API Gateway's* public callback URL.
  console.log('  Callback URL for Strategy:', process.env.GOOGLE_CALLBACK_URL);


  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // This MUST match what Google is configured to redirect to (the API Gateway URL)
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('AuthService Google Profile Data:', { id: profile.id, displayName: profile.displayName, email: profile.emails?.[0]?.value });

        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        if (!email) {
           console.error('AuthService Google OAuth Error: Email not provided by Google profile.');
           return done(new Error('Email address not provided by Google. Please ensure your Google account has a primary email and permissions are granted.'), null);
        }

        const desiredUserType = 'Farmer';

        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log(`AuthService: Found existing user by googleId: ${user.email}`);
            let updated = false;
            if (user.userType !== desiredUserType) {
              console.log(`AuthService: Updating userType for ${user.email} from ${user.userType} to ${desiredUserType}`);
              user.userType = desiredUserType;
              updated = true;
            }
            if (profile.displayName && user.name !== profile.displayName) {
                console.log(`AuthService: Updating name for ${user.email} from ${user.name} to ${profile.displayName}`);
                user.name = profile.displayName;
                updated = true;
            }
            if (updated) {
              await user.save();
              console.log(`AuthService: User ${user.email} updated successfully.`);
            }
            return done(null, user);
          }

          console.log(`AuthService: No user found by googleId ${profile.id}. Checking by email: ${email}`);
          user = await User.findOne({ email: email });

          if (user) {
            console.log(`AuthService: Found existing user by email: ${user.email}. Linking googleId and ensuring userType is Farmer.`);
            user.googleId = profile.id;
            user.userType = desiredUserType;
            if (profile.displayName && (!user.name || user.name !== profile.displayName)) {
                user.name = profile.displayName;
            }
            await user.save();
            console.log(`AuthService: User ${user.email} (linked with Google) updated successfully.`);
            return done(null, user);
          }

          console.log(`AuthService: No existing user found. Creating new Farmer user with Google details: ${email}`);
          const newUserDetails = {
            googleId: profile.id,
            name: profile.displayName || `User ${profile.id.slice(-5)}`,
            email: email,
            userType: desiredUserType,
          };
          user = await User.create(newUserDetails);
          console.log(`AuthService: New Farmer user created: ${user.email}`);
          return done(null, user);

        } catch (err) {
          console.error('AuthService: Error during Google OAuth database operations:', err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        console.error('AuthService: Error deserializing user:', err);
        done(err, null);
      }
  });
}