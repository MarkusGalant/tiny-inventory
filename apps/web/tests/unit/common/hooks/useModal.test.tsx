import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useModal } from '@/features/common/hooks/useModal';

describe('useModal', () => {
  it('open and close updates state', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.open({ id: '1' });
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toEqual({ id: '1' });

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
