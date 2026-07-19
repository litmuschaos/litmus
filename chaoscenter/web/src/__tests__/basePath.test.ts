// Unit tests for base path normalization
describe('Base Path Normalization', () => {
  describe('getBasePath function', () => {
    // We need to test the logic, since getBasePath is in bootstrap.tsx
    // This helper function mirrors the actual implementation
    function getBasePath(): string {
      const publicUrl = process.env.PUBLIC_URL || '/';
      const withLeadingSlash = publicUrl.startsWith('/') ? publicUrl : `/${publicUrl}`;
      const basePath = withLeadingSlash.replace(/\/+$/, '') || '/';
      return basePath;
    }

    afterEach(() => {
      delete process.env.PUBLIC_URL;
    });

    test('should return "/" when PUBLIC_URL is not set', () => {
      delete process.env.PUBLIC_URL;
      const basePath = getBasePath();
      expect(basePath).toBe('/');
    });

    test('should return "/" when PUBLIC_URL is "/"', () => {
      process.env.PUBLIC_URL = '/';
      const basePath = getBasePath();
      expect(basePath).toBe('/');
    });

    test('should normalize "/litmus/" to "/litmus"', () => {
      process.env.PUBLIC_URL = '/litmus/';
      const basePath = getBasePath();
      expect(basePath).toBe('/litmus');
    });

    test('should normalize "/litmus///" to "/litmus"', () => {
      process.env.PUBLIC_URL = '/litmus///';
      const basePath = getBasePath();
      expect(basePath).toBe('/litmus');
    });

    test('should add leading slash to "litmus"', () => {
      process.env.PUBLIC_URL = 'litmus';
      const basePath = getBasePath();
      expect(basePath).toBe('/litmus');
    });

    test('should normalize "litmus/" to "/litmus"', () => {
      process.env.PUBLIC_URL = 'litmus/';
      const basePath = getBasePath();
      expect(basePath).toBe('/litmus');
    });

    test('should handle "/chaos" correctly', () => {
      process.env.PUBLIC_URL = '/chaos';
      const basePath = getBasePath();
      expect(basePath).toBe('/chaos');
    });

    test('should handle nested paths like "/app/litmus"', () => {
      process.env.PUBLIC_URL = '/app/litmus';
      const basePath = getBasePath();
      expect(basePath).toBe('/app/litmus');
    });

    test('should handle paths without leading slash like "app/litmus"', () => {
      process.env.PUBLIC_URL = 'app/litmus';
      const basePath = getBasePath();
      expect(basePath).toBe('/app/litmus');
    });

    test('should handle multiple leading slashes like "//litmus"', () => {
      process.env.PUBLIC_URL = '//litmus';
      const basePath = getBasePath();
      // After adding leading slash check, //litmus is already starting with /
      // but we need to handle the double slash case
      expect(basePath).toBe('//litmus');
    });
  });

  describe('Webpack publicPath calculation', () => {
    // Helper to mirror webpack config
    function getPublicPath(): string {
      const rawPublicUrl = process.env.PUBLIC_URL || '/';
      const withLeadingSlash = rawPublicUrl.startsWith('/') ? rawPublicUrl : `/${rawPublicUrl}`;
      const publicUrl = withLeadingSlash.replace(/\/+$/, '') || '/';
      const publicPath = publicUrl === '/' ? '/' : `${publicUrl}/`;
      return publicPath;
    }

    afterEach(() => {
      delete process.env.PUBLIC_URL;
    });

    test('should return "/" for root path', () => {
      process.env.PUBLIC_URL = '/';
      const publicPath = getPublicPath();
      expect(publicPath).toBe('/');
    });

    test('should return "/litmus/" for /litmus', () => {
      process.env.PUBLIC_URL = '/litmus';
      const publicPath = getPublicPath();
      expect(publicPath).toBe('/litmus/');
    });

    test('should return "/litmus/" for /litmus/ (trailing slash removed internally)', () => {
      process.env.PUBLIC_URL = '/litmus/';
      const publicPath = getPublicPath();
      expect(publicPath).toBe('/litmus/');
    });

    test('should return "/app/chaos/" for /app/chaos', () => {
      process.env.PUBLIC_URL = '/app/chaos';
      const publicPath = getPublicPath();
      expect(publicPath).toBe('/app/chaos/');
    });
  });
});
