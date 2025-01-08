export const AUTH_ROUTES = {
  LOGIN: '/login',
  JOIN: '/join',
  AFTER_LOGIN: '/songbook',
  AFTER_JOIN: '/songbook?newUser=true',
} as const;

export const getRedirectUrl = (isNewUser: boolean): string => {
  return isNewUser ? AUTH_ROUTES.AFTER_JOIN : AUTH_ROUTES.AFTER_LOGIN;
};

export const getActionCodeSettings = (returnUrl: string) => ({
  url: `${typeof window !== 'undefined' ? window.location.origin : ''}${returnUrl}`,
  handleCodeInApp: true,
}); 