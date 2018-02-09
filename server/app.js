const express = require('express');
const app = express();


// ----------------------------------------
// App Variables
// ----------------------------------------
app.locals.appName = 'My App';


// ----------------------------------------
// CORS
// ----------------------------------------
const cors = require('cors');
app.use(cors());


// ----------------------------------------
// ENV
// ----------------------------------------
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


// ----------------------------------------
// Body Parser
// ----------------------------------------
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// ----------------------------------------
// Sessions/Cookies
// ----------------------------------------
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [
    process.env.SESSION_SECRET || 'secret'
  ]
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


// ----------------------------------------
// Flash Messages
// ----------------------------------------
const flash = require('express-flash-messages');
app.use(flash());


// ----------------------------------------
// Method Override
// ----------------------------------------
const methodOverride = require('method-override');
const getPostSupport = require('express-method-override-get-post-support');

app.use(methodOverride(
  getPostSupport.callback,
  getPostSupport.options // { methods: ['POST', 'GET'] }
));


// ----------------------------------------
// Referrer
// ----------------------------------------
app.use((req, res, next) => {
  req.session.backUrl = req.header('Referer') || '/';
  next();
});


// ----------------------------------------
// Public
// ----------------------------------------
app.use(express.static(`${__dirname}/public`));


// ----------------------------------------
// Passport
// ----------------------------------------
const passport = require('passport');
app.use(passport.initialize());


// ----------------------------------------
// JWTs
// ----------------------------------------
const JWT_SECRET = 'secret';
const JWT_ISSUER = 'localhost:3000';
const JWT_AUDIENCE = 'localhost:3001';

const jwt = require('jsonwebtoken');
const {
  Strategy: JwtStrategy,
  ExtractJwt
} = require('passport-jwt');

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE
}, function(payload, done) {
  console.log(payload);
  done(null, { username: 'foobar', id: 1 });
}));


// ----------------------------------------
// Logging
// ----------------------------------------
const morgan = require('morgan');
const morganToolkit = require('morgan-toolkit')(morgan);

app.use(morganToolkit());


// ----------------------------------------
// Routes
// ----------------------------------------
app.get('/', (req, res) => {
  res.render('welcome/index');
});


app.post('/login', (req, res) => {
  if (req.body.username === 'foobar' && req.body.password === 'password') {
    const payload = { id: 1 };
    const token = jwt.sign(payload, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE
    });
    return res.json({ token });
  }

  res.status(401).json({ error: 'Unauthorized' });
});


app.get(
  '/secret',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);


// ----------------------------------------
// Template Engine
// ----------------------------------------
const expressHandlebars = require('express-handlebars');
const helpers = require('./helpers');

const hbs = expressHandlebars.create({
  helpers: helpers,
  partialsDir: 'views/',
  defaultLayout: 'application'
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


// ----------------------------------------
// Server
// ----------------------------------------
const port = process.env.PORT ||
  process.argv[2] ||
  3000;
const host = 'localhost';

const args = process.env.NODE_ENV === 'production' ?
  [port] :
  [port, host];

args.push(() => {
  console.log(`Listening: http://${ host }:${ port }\n`);
});

if (require.main === module) {
  app.listen.apply(app, args);
}


// ----------------------------------------
// Error Handling
// ----------------------------------------
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.stack) {
    err = err.stack;
  }
  console.log(err);
  res.status(500).json({ error: err });
});


module.exports = app;






