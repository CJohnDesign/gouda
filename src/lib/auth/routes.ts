export const AUTH_ROUTES = {
  LOGIN: '/login',
  JOIN: '/waitlist',
  AFTER_LOGIN: '/playlists',
  AFTER_JOIN: '/playlists?newUser=true',
} as const;

export const getRedirectUrl = (isNewUser: boolean): string => {
  return isNewUser ? AUTH_ROUTES.AFTER_JOIN : AUTH_ROUTES.AFTER_LOGIN;
};

export const getActionCodeSettings = (returnUrl: string) => ({
  url: `${typeof window !== 'undefined' ? window.location.origin : ''}${returnUrl}`,
  handleCodeInApp: true,
}); 