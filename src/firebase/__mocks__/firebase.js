import { jest } from '@jest/globals';

const mockApp = {
  name: '[DEFAULT]',
  options: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef',
    measurementId: 'G-TEST123'
  }
};

const mockAnalytics = {
  app: mockApp,
  logEvent: jest.fn(),
  setCurrentScreen: jest.fn(),
  setUserId: jest.fn()
};

export const app = mockApp;
export const analytics = mockAnalytics; 