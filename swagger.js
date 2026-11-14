
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kizuna Rail Trips API',
      version: '1.0.0',
      description: 'API documentation for Kizuna Rail trips.'
    },
    components: {
      schemas: {
        Trip: {
          type: 'object',
          required: [
            'id',
            'name',
            'region',
            'startStation',
            'endStation',
            'distance'
          ],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            region: { type: 'string' },
            startStation: { type: 'string' },
            endStation: { type: 'string' },
            duration: { type: 'string' },
            distance: { type: 'number', minimum: 0 },
            highlights: {
              type: 'array',
              items: { type: 'string' }
            },
            bestSeason: { type: 'string' },
            operatingMonths: {
              type: 'array',
              items: { type: 'number' }
            },
            imageUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/router.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
