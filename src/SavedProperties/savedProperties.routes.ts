import { Hono } from 'hono';
import * as savedPropertiesController from './savedProperties.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const savedPropertiesRoutes = new Hono();

// All routes are protected
savedPropertiesRoutes.use('/*', authenticate);

savedPropertiesRoutes.get('/users/:userId/saved', savedPropertiesController.getSavedPropertiesByUserId);
savedPropertiesRoutes.post('/users/:userId/saved', savedPropertiesController.saveProperty);
savedPropertiesRoutes.delete('/users/:userId/saved/:propertyId', savedPropertiesController.unsaveProperty);
savedPropertiesRoutes.get('/users/:userId/saved/:propertyId/check', savedPropertiesController.isPropertySaved);

export default savedPropertiesRoutes;
