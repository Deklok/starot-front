// notificationStore.ts

import { writable, get } from 'svelte/store';

interface NotificationState {
  isOpen: boolean;
  isClosing: boolean;
  isError: boolean;
  message: string;
}

const initialState: NotificationState = {
  isOpen: false,
  isClosing: false,
  isError: false,
  message: ''
};

// Create the actual store
const store = writable<NotificationState>(initialState);

// Keep track of the timeout outside the store to avoid serialization issues
let activeTimeout: ReturnType<typeof setTimeout> | null = null;

function clearActiveTimeout() {
  if (activeTimeout !== null) {
    clearTimeout(activeTimeout);
    activeTimeout = null;
  }
}

// Public API
export const notification = {
  subscribe: store.subscribe,
  
  open: (message: string, isError = false) => {
    // Clear any existing timeout
    clearActiveTimeout();
    
    // Update the store immediately
    store.set({
      isOpen: true,
      isClosing: false,
      isError,
      message
    });
    
    // Set new timeout for auto-close
    activeTimeout = setTimeout(() => {
      const currentState = get(store);
      
      if (currentState.isOpen) {
        notification.close();
      }
    }, 3000);
  },
  
  close: () => {
    clearActiveTimeout();
    
    store.update(state => ({
      ...state,
      isOpen: false,
      isClosing: true
    }));
  },
  
  finishClose: () => {
    store.set(initialState);
  },
  
  reset: () => {
    clearActiveTimeout();
    store.set(initialState);
  }
};