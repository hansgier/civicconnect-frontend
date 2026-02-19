import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcutsOptions {
  onSearchFocus?: () => void;
  onCreateNew?: () => void;
  onClose?: () => void;
  onSubmit?: () => void;
  isDialogOpen?: boolean;
}

/**
 * Hook for keyboard navigation shortcuts in admin panel
 * 
 * Shortcuts:
 * - `/` - Focus search input
 * - `n` - Open create dialog (when not in dialog)
 * - `esc` - Close dialog
 * - `ctrl/cmd + enter` - Submit form
 */
export function useKeyboardShortcuts({
  onSearchFocus,
  onCreateNew,
  onClose,
  onSubmit,
  isDialogOpen = false,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        // Allow escape and cmd+enter even when typing
        if (event.key !== 'Escape' && !(event.key === 'Enter' && (event.metaKey || event.ctrlKey))) {
          return;
        }
      }

      switch (event.key) {
        case '/':
          // Focus search - prevent default to avoid typing "/"
          event.preventDefault();
          if (!isDialogOpen && onSearchFocus) {
            onSearchFocus();
          }
          break;

        case 'n':
        case 'N':
          // Create new - only when not in dialog and not typing
          if (!isDialogOpen && onCreateNew) {
            onCreateNew();
          }
          break;

        case 'Escape':
          // Close dialog
          if (isDialogOpen && onClose) {
            onClose();
          }
          break;

        case 'Enter':
          // Submit form with cmd/ctrl + enter
          if ((event.metaKey || event.ctrlKey) && onSubmit) {
            event.preventDefault();
            onSubmit();
          }
          break;
      }
    },
    [onSearchFocus, onCreateNew, onClose, onSubmit, isDialogOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Hook for managing focus within a dialog
 * Implements focus trap and returns focus to trigger on close
 */
export function useDialogFocus(isOpen: boolean, onClose?: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first focusable element after a short delay
      const timer = setTimeout(() => {
        if (dialogRef.current) {
          const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          firstFocusableRef.current = focusableElements[0];
          firstFocusableRef.current?.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Return focus to previous element
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Trap focus within dialog
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return dialogRef;
}

/**
 * Hook for announcing changes to screen readers
 */
export function useLiveAnnouncer() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement is read
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return { announce };
}
