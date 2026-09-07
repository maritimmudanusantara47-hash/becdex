import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server instance for Node.js test environment.
 * Started/stopped in src/test/setup.ts.
 */
export const server = setupServer(...handlers);
