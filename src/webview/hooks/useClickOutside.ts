import { useEffect, type RefObject } from 'react';

/**
 * Hook that calls `onClose` when a mousedown event occurs outside
 * the referenced element. Used to close dropdown menus on outside click.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!isOpen) return;

    const handler = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, isOpen, onClose]);
}
