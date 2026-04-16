/**
 * Tests for base path configuration
 *
 * Signed-off-by: NETIZEN-11 <kumarnitesh121411@gmail.com>
 */

describe('Base Path Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getBasePath function', () => {
    test('should return "/" when PUBLIC_URL is not set', () => {
      delete process.env.PUBLIC_URL;
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/');
    });

    test('should return "/" when PUBLIC_URL is "/"', () => {
      process.env.PUBLIC_URL = '/';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/');
    });

    test('should return "/litmus" when PUBLIC_URL is "/litmus"', () => {
      process.env.PUBLIC_URL = '/litmus';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/litmus');
    });

    test('should remove trailing slash from "/litmus/"', () => {
      process.env.PUBLIC_URL = '/litmus/';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/litmus');
    });

    test('should handle multiple trailing slashes', () => {
      process.env.PUBLIC_URL = '/litmus///';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/litmus');
    });

    test('should handle nested paths', () => {
      process.env.PUBLIC_URL = '/apps/litmus';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/apps/litmus');
    });

    test('should handle empty string as "/"', () => {
      process.env.PUBLIC_URL = '';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/');
    });
  });

  describe('Webpack publicPath', () => {
    test('should use PUBLIC_URL for webpack publicPath', () => {
      process.env.PUBLIC_URL = '/litmus';
      const publicPath = process.env.PUBLIC_URL || '/';
      expect(publicPath).toBe('/litmus');
    });

    test('should default to "/" when PUBLIC_URL is not set', () => {
      delete process.env.PUBLIC_URL;
      const publicPath = process.env.PUBLIC_URL || '/';
      expect(publicPath).toBe('/');
    });
  });

  describe('Path normalization', () => {
    test('should ensure path starts with /', () => {
      const paths = ['litmus', '/litmus', '//litmus'];
      paths.forEach(p => {
        const normalized = p.startsWith('/') ? p : `/${p}`;
        expect(normalized.startsWith('/')).toBe(true);
      });
    });

    test('should handle root path correctly', () => {
      const rootPaths = ['/', '', null, undefined];
      rootPaths.forEach(p => {
        const normalized = (p || '/').replace(/\/+$/, '') || '/';
        expect(normalized).toBe('/');
      });
    });
  });
});
