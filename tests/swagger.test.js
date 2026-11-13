import { describe, expect, test, vi } from 'vitest';
import express, { Router } from 'express';
import request from 'supertest';
import { swaggerSpec } from '../swagger.js';

const toOpenApiPath = (expressPath) => {
  return expressPath.replace(/:([^/]+)/g, '{$1}');
};

const collectRoutes = (stack, mounts, prefix = '') => {
  const routes = [];

  for (const layer of stack) {
    if (layer.route) {
      const expressPaths = Array.isArray(layer.route.path)
        ? layer.route.path
        : [layer.route.path];

      for (const expressPath of expressPaths) {
        if (typeof expressPath !== 'string') {
          throw new Error('Swagger coverage requires string route paths.');
        }

        const path = toOpenApiPath(`${prefix}${expressPath}`).replace(/\/+$/, '') || '/';
        for (const method of Object.keys(layer.route.methods)) {
          routes.push({ method, path });
        }
      }
    } else if (layer.handle && Array.isArray(layer.handle.stack)) {
      const mountPaths = mounts.get(layer);
      if (!mountPaths) {
        throw new Error('Router mount was not captured for Swagger coverage.');
      }

      for (const mountPath of mountPaths) {
        if (typeof mountPath !== 'string') {
          throw new Error('Swagger coverage requires string router mount paths.');
        }
        const mountedPrefix = `${prefix}${mountPath}`.replace(/\/+$/, '');
        routes.push(...collectRoutes(layer.handle.stack, mounts, mountedPrefix));
      }
    }
  }

  return routes;
};

// Express 5 does not expose mount paths on layers; capture them during registration.
const discoverRoutes = async (createApp) => {
  const mounts = new WeakMap();
  const originalUse = Router.prototype.use;
  const useSpy = vi.spyOn(Router.prototype, 'use').mockImplementation(function (...args) {
    const start = this.stack.length;
    const first = args[0];
    const paths = typeof first === 'function' || (Array.isArray(first) && typeof first.flat(Infinity)[0] === 'function')
      ? ['/']
      : (Array.isArray(first) ? first : [first]);
    const result = originalUse.apply(this, args);

    for (const layer of this.stack.slice(start)) {
      mounts.set(layer, paths);
    }
    return result;
  });

  try {
    const app = await createApp();
    return { app, routes: collectRoutes(app.router.stack, mounts) };
  } finally {
    useSpy.mockRestore();
  }
};

const { app, routes } = await discoverRoutes(async () => {
  return (await import('../app.js')).default;
});

describe('Swagger documentation', () => {
  test('builds the OpenAPI spec in process', () => {
    expect(swaggerSpec).toBeDefined();
    expect(swaggerSpec.openapi).toBe('3.0.0');
    expect(swaggerSpec.paths).toHaveProperty('/api/trains');
  });

  describe('Application route documentation coverage', () => {
    test('application routes were discovered from the app', () => {
      expect(routes.length).toBeGreaterThan(0);
    });

    test.each(routes)('$method $path is documented', ({ method, path }) => {
      expect(
        swaggerSpec.paths[path]?.[method],
        `Missing Swagger documentation: ${method.toUpperCase()} ${path}`
      ).toBeDefined();
    });

    test('discovers page routes and nested router prefixes with parameters', async () => {
      const { routes: discovered } = await discoverRoutes(() => {
        const fixture = express();
        const outer = Router();
        const inner = Router();

        fixture.get('/about', (req, res) => res.end());
        inner.get('/:id', (req, res) => res.end());
        outer.use('/items', inner);
        fixture.use('/trips', outer);
        return fixture;
      });

      expect(discovered).toEqual([
        { method: 'get', path: '/about' },
        { method: 'get', path: '/trips/items/{id}' }
      ]);
    });
  });

  test('serves the Swagger UI at /api-docs', async () => {
    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
  });
});
