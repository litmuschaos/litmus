import { renderHook } from '@testing-library/react-hooks';
import { getImageRegistry } from '@api/core/ImageRegistry';
import { useImageRegistry } from '../useImageRegistry';
import { useAppStore } from '../useAppStore';

jest.mock('@api/core/ImageRegistry', () => ({
  getImageRegistry: jest.fn()
}));

jest.mock('../useAppStore', () => ({
  useAppStore: jest.fn()
}));

const mockGetImageRegistry = getImageRegistry as jest.Mock;
const mockUseAppStore = useAppStore as jest.Mock;

const registryResponse = (imageRegistryName: string): object => ({
  data: {
    getImageRegistry: {
      imageRegistryInfo: {
        imageRegistryName,
        imageRepoName: 'team/chaos',
        secretName: 'registry-secret'
      }
    }
  },
  loading: false
});

describe('useImageRegistry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppStore.mockReturnValue({ projectID: 'project-id' });
  });

  test('includes a configured registry hostname in the repository', () => {
    mockGetImageRegistry.mockReturnValue(registryResponse('registry.example.com'));

    const { result } = renderHook(() => useImageRegistry());

    expect(result.current.imageRegistry?.repo).toBe('registry.example.com/team/chaos');
    expect(result.current.imageRegistry?.secret).toBe('registry-secret');
  });

  test('uses only the repository when the registry hostname is empty', () => {
    mockGetImageRegistry.mockReturnValue(registryResponse(''));

    const { result } = renderHook(() => useImageRegistry());

    expect(result.current.imageRegistry?.repo).toBe('team/chaos');
  });

  test('uses the default registry when no registry is configured', () => {
    mockGetImageRegistry.mockReturnValue({ data: undefined, loading: false });

    const { result } = renderHook(() => useImageRegistry());

    expect(result.current.imageRegistry?.repo).toBe('litmuschaos');
    expect(result.current.imageRegistry?.secret).toBe('');
  });
});
