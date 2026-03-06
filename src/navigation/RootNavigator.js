import React from 'react';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import useAuth from '../hooks/useAuth';

export default function RootNavigator() {
  const { session } = useAuth();

  // Auth flow entrypoint: logged-in users see app routes, others see login routes.
  if (!session) {
    return <AuthNavigator />;
  }

  return <AppNavigator />;
}
