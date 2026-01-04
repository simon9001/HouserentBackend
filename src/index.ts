import { serve } from "@hono/node-server";
import { prometheus } from "@hono/prometheus";
import { Hono, type Context } from "hono";
import { logger } from "hono/logger";

import initializeDatabaseConnection from "./Database/config.js";
import { limiter } from "./middleware/ratelimmiter.js";
import { cors } from 'hono/cors';
import adminRoutes from './admin/adminRoutes.js'
import userRoutes from './Users/userRoutes.js'
import authRoutes from "./Auth/auth.routes.js";
import propertyAmenitiesRoutes from "./PropertyAmenities/propertyAmenities.routes.js";
import propertyMediaRoutes from "./PropertyMedia/propertyMedia.routes.js";
import propertiesRoutes from "./Properties/properties.routes.js";
import userFollowsRoutes from "./UserFollows/userFollows.routes.js";
import reviewsRoutes from "./Reviews/reviews.routes.js";
import propertyVisitsRoutes from "./PropertyVisits/propertyVisits.routes.js";
import paymentsRoutes from "./Payments/payments.routes.js";
import auditLogsRoutes from "./AuditLogs/auditLogs.routes.js";
import agentVerificationRoutes from "./AgentVerification/agentRoutes.js";
import subscriptionRoutes from "./Subscription/subscription.routes.js";
import notificationRoutes from "./Notifications/notifications.routes.js";
import statusRoutes from "./Status/status.routes.js";


const app = new Hono();
const initDatabaseConnection = initializeDatabaseConnection;

// ✅ Enable CORS for your React frontend
app.use(
  '*',
  cors({
    origin: [
      'https://getkeja.netlify.app',
      'http://localhost:5173',
    ],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// ─── Monitoring with Prometheus ──────────────────────────────
const { printMetrics, registerMetrics } = prometheus();
app.use("*", registerMetrics);
app.get("/metrics", printMetrics);

// ─── Middlewares ─────────────────────────────────────────────
app.use("*", logger()); // logs request and response
app.use(limiter); // rate limiter


app.route('api', adminRoutes);
app.route('api', userRoutes);
app.route('api/auth', authRoutes);
app.route('api/v1', propertyAmenitiesRoutes);
app.route('api', propertyMediaRoutes);
// app.route('api', propertiesRoutes);
app.route('api', userFollowsRoutes);
app.route('api', reviewsRoutes);
app.route('api', propertyVisitsRoutes);
app.route('api', propertyMediaRoutes);
app.route('api', propertyAmenitiesRoutes);
app.route('api/properties', propertiesRoutes);
app.route('api', paymentsRoutes);
app.route('api', auditLogsRoutes);
app.route('api', agentVerificationRoutes);
app.route('api', subscriptionRoutes);
app.route('api/notifications', notificationRoutes);
app.route('api/status', statusRoutes);


// ─── Base Endpoint ───────────────────────────────────────────
app.get("/", (c: Context) => {
  return c.json({
    message: "Welcome to the Restaurant Management System API",
    documentation: "Visit /api for available endpoints",
    status: "API is running successfully 🚀",
  });
});


// ─── Database Init and Server Start ───────────────────────────
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000; // fallback for local dev

initDatabaseConnection()
  .then(() => {
    serve(
      {
        fetch: app.fetch,
        port, // use dynamic port
      },
      (info) => {
        console.log(`Server is running at port ${info.port}`);
      }
    );
  })
  .catch((error) => {
    console.error("Failed to initialize database connection:", error);
  });

