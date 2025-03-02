// notificationStore.ts

import { writable, type Writable } from 'svelte/store';

interface NotificationStore {
  isOpen: boolean;
  isError: boolean;
  message: string;
}

const initialNotificationState: NotificationStore = {
  isOpen: false,
  isError: false,
  message: '',
};

const notificationStore: Writable<NotificationStore> = writable(initialNotificationState);

export const notification = {
  subscribe: notificationStore.subscribe,
  set: (newState: NotificationStore) => notificationStore.set(newState),
  update: (updater: (value: NotificationStore) => NotificationStore) => notificationStore.update(updater),
  open: (message: string, isError = false) => {
    notificationStore.update((state) => ({
      ...state,
      isOpen: true,
      isError,
      message,
    }));

    setTimeout(() => {
        notificationStore.update((state) => ({
          ...state,
          isOpen: false,
          message: '',
        }));
      }, 3000); // 3000 milliseconds = 3 seconds
  },
  close: () => {
    notificationStore.update((state) => ({
      ...state,
      isOpen: false,
      message: '',
    }));
  },
  reset: () => notificationStore.set(initialNotificationState),
};