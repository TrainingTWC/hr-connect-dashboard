// Enhanced haptic feedback utilities optimized for modern Android devices (Samsung S23, etc.)

export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
  // Check if the device supports haptic feedback
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        // Short, crisp tap - like button press
        navigator.vibrate(15);
        break;
      case 'medium':
        // Medium intensity - like selection feedback
        navigator.vibrate(25);
        break;
      case 'heavy':
        // Strong feedback - like confirmation
        navigator.vibrate(40);
        break;
      case 'success':
        // Double tap pattern - like successful action
        navigator.vibrate([30, 20, 30]);
        break;
      case 'warning':
        // Triple tap pattern - attention grabbing
        navigator.vibrate([20, 15, 20, 15, 20]);
        break;
      case 'error':
        // Strong error pattern - unmistakable feedback
        navigator.vibrate([50, 30, 50, 30, 50]);
        break;
      default:
        navigator.vibrate(25);
    }
  }

  // Enhanced iOS Taptic Engine support
  if (typeof window !== 'undefined') {
    try {
      // Modern iOS Haptic Feedback API
      if ('HapticFeedback' in window) {
        const hapticAPI = (window as any).HapticFeedback;
        switch (type) {
          case 'light':
            hapticAPI.impact({ style: 'light' });
            break;
          case 'medium':
            hapticAPI.impact({ style: 'medium' });
            break;
          case 'heavy':
            hapticAPI.impact({ style: 'heavy' });
            break;
          case 'success':
            hapticAPI.notification({ type: 'success' });
            break;
          case 'warning':
            hapticAPI.notification({ type: 'warning' });
            break;
          case 'error':
            hapticAPI.notification({ type: 'error' });
            break;
        }
      }
      // Webkit-based haptic support
      else if ('webkit' in window && (window as any).webkit?.messageHandlers?.haptic) {
        (window as any).webkit.messageHandlers.haptic.postMessage({ type });
      }
    } catch (e) {
      console.log('Advanced haptic feedback not available, using standard vibrate');
    }
  }
};

// Enhanced haptic feedback functions with stronger defaults
export const hapticFeedback = {
  // Light tap for UI interactions (theme toggle, etc.)
  tap: () => triggerHapticFeedback('light'),
  
  // Medium feedback for selections and responses
  select: () => triggerHapticFeedback('medium'),
  
  // Heavy feedback for important actions
  confirm: () => triggerHapticFeedback('heavy'),
  
  // Success pattern for completed actions
  success: () => triggerHapticFeedback('success'),
  
  // Warning pattern for validation issues
  warning: () => triggerHapticFeedback('warning'),
  
  // Error pattern for failures
  error: () => triggerHapticFeedback('error'),
  
  // Custom strong feedback for premium feel (like ChatGPT app)
  strong: () => {
    if ('vibrate' in navigator) {
      // Strong, satisfying feedback pattern
      navigator.vibrate([35, 10, 35]);
    }
  },
  
  // Ultra-strong feedback for major actions
  ultraStrong: () => {
    if ('vibrate' in navigator) {
      // Very strong pattern similar to premium apps
      navigator.vibrate([50, 15, 50, 15, 30]);
    }
  }
};