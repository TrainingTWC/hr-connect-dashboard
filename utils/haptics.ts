// Haptic feedback utilities for mobile devices

export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  // Check if the device supports haptic feedback
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
      case 'success':
        navigator.vibrate([25, 50, 25]);
        break;
      case 'warning':
        navigator.vibrate([50, 100, 50]);
        break;
      case 'error':
        navigator.vibrate([100, 50, 100, 50, 100]);
        break;
      default:
        navigator.vibrate(10);
    }
  }

  // For iOS devices that support Taptic Engine (iOS 10+)
  if ('Taptic' in window || 'webkit' in window) {
    try {
      // Try to use iOS Haptic Feedback API if available
      if ('HapticFeedback' in window) {
        switch (type) {
          case 'light':
            (window as any).HapticFeedback.impact({ style: 'light' });
            break;
          case 'medium':
            (window as any).HapticFeedback.impact({ style: 'medium' });
            break;
          case 'heavy':
            (window as any).HapticFeedback.impact({ style: 'heavy' });
            break;
          case 'success':
            (window as any).HapticFeedback.notification({ type: 'success' });
            break;
          case 'warning':
            (window as any).HapticFeedback.notification({ type: 'warning' });
            break;
          case 'error':
            (window as any).HapticFeedback.notification({ type: 'error' });
            break;
        }
      }
    } catch (e) {
      // Fallback to vibrate if Taptic Engine fails
      console.log('Haptic feedback not available, using vibrate fallback');
    }
  }
};

export const hapticFeedback = {
  light: () => triggerHapticFeedback('light'),
  medium: () => triggerHapticFeedback('medium'),
  heavy: () => triggerHapticFeedback('heavy'),
  success: () => triggerHapticFeedback('success'),
  warning: () => triggerHapticFeedback('warning'),
  error: () => triggerHapticFeedback('error'),
};