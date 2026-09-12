// ===================================================================================================
// Express App Imports
// ===================================================================================================

import express from 'express'; // imported to help create express app (to use as backend server)

import cors from 'cors';       // CORS middleware allows frontend (HTML/JS) to access server (backend) from a different origin
                               // Example: If HTML page is on localhost:5500 while backend server is on localhost:3000,
                               //          CORS enables these different ports (as well as subdomains) to communicate 

import cookieParser from 'cookie-parser'; // middleware import used to read cookies (for JWT and CSRF)
import session from 'express-session';    // required by passport (even when JWT is used, Google OAuth needs session temporarily)
import passport from 'passport';          // Core authentication framework

import swaggerUi from 'swagger-ui-express';   // Middleware to serve Swagger UI at a route like '/api-docs'
import swaggerSpec from './swaggerConfig.js'; // Imports generated Swagger specification object (contains API metadata and route definitions)
                                              // used by Swagger UI to present data to user


// ===================================================================================================
// Routes Imports
// ===================================================================================================

import './auth/passportConfig.js';  // Loads and registers passport strategies globally (MUST come before routes!)

import authRoutes from './routes/authRoutes.js';       // Authentication-related routes (e.g. /auth/login, /auth/google)

import productRoutes from './routes/productRoutes.js'; // import default export 'router' as 'productRoutes'
                                                       // handles product-related routes (e.g. '/products/:category')

import userRoutes from './routes/userRoutes.js'; // imports default export 'router' as 'userRoutes'
                                                 // handles retrieval and editing of user-data

import cartRoutes from './routes/cartRoutes.js'; //  import default export 'router' as 'cartRoutes'
                                                 //  handles storing,retrieval,and editing of cart items 
                                                 //  in database for logged in users.

import checkoutRoutes from './routes/checkoutRoutes.js'; // import default export 'router' as 'checkoutRoutes'
                                                         // where 

import ordersRoutes from './routes/ordersRoutes.js';

import dotenv from 'dotenv'; // loads .env variables into process.env 
                             // so they can be accessed anywhere in server code
dotenv.config();

// ===================================================================================================
// Create Express App
// ===================================================================================================

const app  = express();                  // Initialize Express application
const port = process.env.PORT || 5000;   // define back-end port

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger UI setup (must come after 'app' is defined)


// ==============================================================================
// Middleware Setup
// ==============================================================================

app.use(cors({    // mount and enable CORS middleware onto express app
  //origin: 'http://localhost:3000',          // Allow requests from frontend (5173 or 3000?)
  origin: process.env.CLIENT_HOME_URL,
  credentials: true                         // Allow cookies/credentials to be sent from front-end     
}));


app.use(express.json());     // Tells express to parse ANY JSON data in the body/payload 
                             // of incoming requests and conver that json data into 
                             // javascript object(s) the can be used via route handlers.

app.use(cookieParser());    // Parses and extracts cookies from request headers

app.use(session({           // Session setup (used by Google OAuth during login handshake)
  secret: process.env.SESSION_SECRET || 'fallbackSecret', // Session encryption key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // Set to true if using HTTPS in production
}));

app.use(passport.initialize());  // Initialize Passport middleware
app.use(passport.session());     // Allow persistent login sessions (required for Google OAuth login)



// ==============================================================================
// Static Files for Product Images
// ==============================================================================
app.use('/images', express.static('public/images')); // Serves product images in 'public/images/' folder static (MUST USE to access product images)


// ==============================================================================
// Routes Mounting
// ==============================================================================
app.use('/', productRoutes);   // Mount all routes for handling product-related requests (e.g. '/products' , '/products/fishes')     

app.use('/', authRoutes); /* Mount all routes for handling authentication-related 
                           * routes (e.g., '/auth/login', '/auth/google').
                           * '/auth' could be used instead of '/' for grouping and clarity,
                           * However, since all auth routes already have '/auth' in their routes (in authRoutes.js),
                           * Adding '/auth' here would yield routes like ('/auth/auth/login') which is undesired.
                           * IF I wanted, I could get rid of '/auth' from routes in order to add '/auth' here.
                           * This would make it scalable and easier to "swap" routes around if needed.
                           */

app.use('/', userRoutes); /* Mount all routes for handling user-related 
                           * requests (e.g., /profile GET and PATCH). 
                           */
                            
app.use('/', cartRoutes); /* Mount cart routes for handling cart 
                           * items stored database for logged in users. 
                           */

app.use('/', checkoutRoutes);

app.use('/', ordersRoutes);



// ==============================================================================
// Start Server
// ==============================================================================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});