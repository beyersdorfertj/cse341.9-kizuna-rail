xanen - practice - branch

sugested pranch name: <Issue>-<name>-ShortDescription  f.e. 0-tjb-my_text

## Swagger documentation

Swagger UI is available at `/api-docs`. Add endpoint documentation as `@openapi` blocks in `src/docs/openapi.js`; `swagger.js` builds the specification in memory. The tests in `tests/swagger.test.js` check every registered application route, including HTML pages and mounted routers. Missing documentation fails the tests with the HTTP method and full route path.

Run the tests from the project root:

- `npm test` runs all tests once.
- `npm test -- tests/swagger.test.js` runs only the Swagger tests.
- `npm run test:watch` starts watch mode and reruns tests when files change.

Tests use a temporary MongoDB database; a running application server is not required.