import serverless from 'serverless-http';
import { createApp } from '../../apps/api/dist/app.js';

const app = createApp();

export const handler = serverless(app);
