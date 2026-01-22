import { useState } from 'react';

export const useModal = <T>(initialState?: T) => {
  const [state, setState] = useState<{ isOpen: boolean; data: T | undefined }>({
    isOpen: false,
    data: initialState,
  });

  const open = (data?: T) => setState({ isOpen: true, data });

  const close = () => setState((prev) => ({ ...prev, isOpen: false, data: undefined }));

  return { ...state, open, close };
};
