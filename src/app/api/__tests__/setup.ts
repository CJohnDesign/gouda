export {}

declare global {
  // eslint-disable-next-line no-var
  var NextRequest: typeof MockRequest;
}

const originalConsoleError = console.error;
const originalConsoleLog = console.log;

console.error = function (...args: unknown[]) {
  if (args[0]?.toString().includes('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.log = function (...args: unknown[]) {
  if (args[0]?.toString().includes('Warning: ReactDOM.render is no longer supported')) {
    return;
  }
  originalConsoleLog.call(console, ...args);
};

// Mock NextRequest
class MockRequest {
  public headers: Headers
  public url: string

  constructor(headers: Headers = new Headers(), url: string = '') {
    this.headers = headers
    this.url = url
  }

  json() {
    return Promise.resolve({})
  }
}

global.NextRequest = MockRequest 