import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { runHybridLabelInspection } from './server/geminiInspector';
import type { IncomingMessage, ServerResponse } from 'node:http';

function packportApiPlugin(): Plugin {
  const attachMiddleware = (middlewares: {
    use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void;
  }) => {
    middlewares.use((req, res, next) => {
      if (!req.url) return next();
      const urlObj = new URL(req.url, 'http://localhost');

      if (req.method === 'GET' && urlObj.pathname === '/api/health') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            ok: true,
            service: 'packport-customs-inspector',
            geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
          })
        );
        return;
      }

      if (req.method === 'POST' && urlObj.pathname === '/api/inspect-label') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const simulateError =
              urlObj.searchParams.get('simulateError') === '1' ||
              Boolean(payload.simulateError);

            if (!payload.label || !payload.label.ingredientList?.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'Please enter at least one ingredient on the label.',
                  field: 'ingredientList',
                })
              );
              return;
            }

            if (
              !payload.label.nutrition ||
              Number(payload.label.nutrition.servingSizeAmount) <= 0
            ) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'Serving size must be greater than 0g.',
                  field: 'servingSizeAmount',
                })
              );
              return;
            }

            const result = await runHybridLabelInspection(
              payload.label,
              payload.resolvedFindingIds || [],
              { simulateError }
            );
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error:
                  err instanceof Error
                    ? err.message
                    : 'Inspection failed unexpectedly.',
              })
            );
          }
        });
        return;
      }

      next();
    });
  };

  return {
    name: 'packport-api-middleware',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

export default defineConfig({
  plugins: [react(), packportApiPlugin()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 5173,
    host: true,
    allowedHosts: true,
  },
});
