import React from 'react';
import AuthNavigator from './AuthNavigator';
import OwnerTabs from './OwnerTabs';
import CleanerTabs from './CleanerTabs';
import SelectOrganizationScreen from '../screens/common/SelectOrganizationScreen';
import useAuth from '../hooks/useAuth';

export default function RootNavigator() {
  const { isAuthenticated, organizationId, role } = useAuth();

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (!organizationId) {
    return <SelectOrganizationScreen />;
  }

  if (role === 'cleaner') {
    return <CleanerTabs />;
  }

  if (role === 'owner' || role === 'admin') {
    return <OwnerTabs />;
  }

  return <SelectOrganizationScreen />;
}
