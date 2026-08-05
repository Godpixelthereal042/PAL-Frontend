/**
 * PAL Test Suite Configuration Reference
 * 
 * Governing Bible Chapters:
 * - Chapter 27: Platform API & Developer Experience (DX) Architecture
 * - Chapter 28: Deployment, Infrastructure & DevOps Architecture
 */

import path from 'path';

export const testConfig = {
  testEnvironment: 'node',
  include: ['tests/**/*.test.mjs', 'tests/**/*.test.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: ['node_modules/', '.next/', 'scratch/'],
  },
  alias: {
    '@': path.resolve(__dirname, './'),
  },
};

export default testConfig;
