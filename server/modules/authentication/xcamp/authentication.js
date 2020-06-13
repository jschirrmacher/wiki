/* global WIKI */

// ------------------------------------
// XCamp Account
// ------------------------------------

const providerKey = 'xcamp'
const XCampStrategy = require('passport-oauth2').Strategy
let rcConfig = {}

module.exports = {
  init (passport, conf) {
    rcConfig = conf
    passport.use('xcamp',
      new XCampStrategy({
        authorizationURL: conf.authorizationURL,
        tokenURL: conf.tokenURL,
        clientID: conf.clientId,
        clientSecret: conf.clientSecret,
        callbackURL: conf.callbackURL
      }, (accessToken, refreshToken, profile, cb) => {
        WIKI.models.users.processProfile(profile).then((user) => {
          return cb(null, user) || true
        }).catch((err) => {
          return cb(err, null) || true
        })
      })
    )
  }
}

XCampStrategy.prototype.userProfile = function(token, done) {
  this._oauth2.get(rcConfig.authorizationURL.replace(/\/oauth\/.*$/, '') + '/api/v1/me', token, function (err, body, res) {
    if (err) {
      return done(new Error(err))
    }
    try {
      const json = JSON.parse(body)
      const profile = {
        id: json._id,
        name: json.username,
        displayName: json.name,
        email: json.email,
        picture: json.avatarUrl
      }
      done(null, { providerKey, profile })
    } catch (ex) {
      return done(new Error('Failed to parse user profile'))
    } 
  })
}
