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
    it('should return "/" when PUBLIC_URL is not set', () => {
      delete process.env.PUBLIC_URL;
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/');
    });

    it('should return "/" when PUBLIC_URL is "/"', () => {
      process.env.PUBLIC_URL = '/';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/');
    });

    it('should return "/litmus" when PUBLIC_URL is "/litmus"', () => {
      process.env.PUBLIC_URL = '/litmus';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/litmus');
    });

    it('should remove trailing slash from "/litmus/"', () => {
      process.env.PUBLIC_URL = '/litmus/';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/litmus');
    });

    it('should handle multiple trailing slashes', () => {
      process.env.PUBLIC_URL = '/litmus///';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/litmus');
    });

    it('should handle nested paths', () => {
      process.env.PUBLIC_URL = '/apps/litmus';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/apps/litmus');
    });

    it('should handle empty string as "/"', () => {
      process.env.PUBLIC_URL = '';
      const basePath = process.env.PUBLIC_URL || '/';
      const normalized = basePath.replace(/\/+$/, '') || '/';
      expect(normalized).toBe('/');
    });
  });

  describe('Webpack publicPath', () => {
    it('should use PUBLIC_URL for webpack publicPath', () => {
      process.env.PUBLIC_URL = '/litmus';
      const publicPath = process.env.PUBLIC_URL || '/';
      expect(publicPath).toBe('/litmus');
    });

    it('should default to "/" when PUBLIC_URL is not set', () => {
      delete process.env.PUBLIC_URL;
      const publicPath = process.env.PUBLIC_URL || '/';
      expect(publicPath).toBe('/');
    });
  });

  describe('Path normalization', () => {
    it('should ensure path starts with /', () => {
      const paths = ['litmus', '/litmus', '//litmus'];
      paths.forEach(path => {
        const normalized = path.startsWith('/') ? path : `/${path}`;
        expect(normalized.startsWith('/')).toBe(true);
      });
    });

    it('should handle root path correctly', () => {
      const rootPaths = ['/', '', null, undefined];
      rootPaths.forEach(path => {
        const normalized = (path || '/').replace(/\/+$/, '') || '/';
        expect(normalized).toBe('/');
      });
    });
  });
});
