import swaggerJsdoc from 'swagger-jsdoc';
import pkg from './package.json' with { type: 'json' };

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kizuna Rail API',
            version: pkg.version,
            description: 'REST API for the Kizuna Rail demo application.'
        }
    },
    // Central OpenAPI documentation, separate from the route implementations.
    apis: ['./src/docs/openapi.js']
};

// Build the OpenAPI spec in memory on import — no swagger.json on disk.
export const swaggerSpec = swaggerJsdoc(options);
