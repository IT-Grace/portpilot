import { integrations, users } from "@shared/schema";
import bcrypt from "bcrypt";
import { and, eq, or } from "drizzle-orm";
import https from "https";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as LocalStrategy } from "passport-local";
import { db } from "./db";

// Custom GitHub Strategy that doesn't fetch emails
class CustomGitHubStrategy extends GitHubStrategy {
  userProfile(accessToken: string, done: any) {
    const options = {
      hostname: "api.github.com",
      path: "/user",
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "PortPilot-App",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const profile = JSON.parse(data);
          const userProfile = {
            id: profile.id,
            username: profile.login,
            displayName: profile.name,
            _json: profile,
            photos: [{ value: profile.avatar_url }],
            // Don't include emails to avoid fetching issues
            emails: [],
          };
          done(null, userProfile);
        } catch (error) {
          done(error);
        }
      });
    });

    req.on("error", done);
    req.end();
  }
}

// Configure Passport GitHub Strategy
passport.use(
  new CustomGitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      // Read-only: public profile plus public repos (which need no scope).
      // PortPilot never writes to GitHub; `user` and `repo` both grant write
      // access, and `repo` has no read-only variant for private repos.
      scope: ["read:user"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      try {
        console.log("GitHub profile received:", {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          emails: profile.emails,
          photos: profile.photos,
        });

        // Extract user data with fallbacks
        const userData = {
          githubId: profile.id,
          handle: profile.username,
          name: profile.displayName || profile.username,
          email:
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : null,
          avatarUrl:
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : null,
          bio: profile._json?.bio || null,
          location: profile._json?.location || null,
          website: profile._json?.blog || profile._json?.html_url || null,
        };

        // Check if user exists
        let user = await db.query.users.findFirst({
          where: eq(users.githubId, profile.id),
        });

        if (user && !user.isActive) {
          console.log("Blocked sign-in for suspended user:", user.handle);
          return done(null, false, { message: "suspended" });
        }

        if (user) {
          // Update existing user
          const [updatedUser] = await db
            .update(users)
            .set({
              name: userData.name,
              email: userData.email,
              avatarUrl: userData.avatarUrl,
              bio: userData.bio,
              location: userData.location,
              website: userData.website,
            })
            .where(eq(users.githubId, profile.id))
            .returning();

          console.log("Updated existing user:", updatedUser.handle);

          // Create or update GitHub integration
          const existingIntegration = await db.query.integrations.findFirst({
            where: and(
              eq(integrations.userId, updatedUser.id),
              eq(integrations.provider, "github")
            ),
          });

          if (existingIntegration) {
            // Update existing integration
            await db
              .update(integrations)
              .set({
                accessToken,
                refreshToken: refreshToken || null,
                scopes: "read:user",
                updatedAt: new Date(),
              })
              .where(eq(integrations.id, existingIntegration.id));
          } else {
            // Create new integration
            await db.insert(integrations).values({
              userId: updatedUser.id,
              provider: "github",
              accessToken,
              refreshToken: refreshToken || null,
              scopes: "read:user",
            });
          }

          return done(null, updatedUser);
        } else {
          // Create new user
          const [newUser] = await db
            .insert(users)
            .values({
              ...userData,
              plan: "FREE",
            })
            .returning();

          console.log("Created new user:", newUser.handle);

          // Create GitHub integration for new user
          await db.insert(integrations).values({
            userId: newUser.id,
            provider: "github",
            accessToken,
            refreshToken: refreshToken || null,
            scopes: "read:user",
          });

          return done(null, newUser);
        }
      } catch (error) {
        console.error("Auth error:", error);
        return done(error, null);
      }
    }
  )
);

// Configure Passport Local Strategy for username/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        // Find user by handle or email
        const user = await db.query.users.findFirst({
          where: or(eq(users.handle, username), eq(users.email, username)),
        });

        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Check if user has a password (not OAuth-only account)
        if (!user.password) {
          return done(null, false, {
            message: "This account uses OAuth login",
          });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Check if account is active
        if (!user.isActive) {
          return done(null, false, { message: "Account is deactivated" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    // Suspended (or deleted) users are signed out on their next request
    done(null, user && user.isActive ? user : false);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
