import express from 'express';
import cors from 'cors';
import coollaaRoutes from './routes/coollaa';
import adminRoutes from './routes/admin';
import designsRoutes from './routes/designs';
import contactsRoutes from './routes/contacts';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Preview static files (dev-test pages)
app.use('/preview', express.static('dev-test'));

// Site routes
app.use('/api/coollaa', coollaaRoutes);

// Voting system routes
app.use('/api', designsRoutes);
app.use('/api', contactsRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

export default app;
