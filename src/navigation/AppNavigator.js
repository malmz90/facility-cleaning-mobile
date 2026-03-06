import React from 'react';
import OwnerTabs from './OwnerTabs';
import CleanerTabs from './CleanerTabs';
import SelectOrganizationScreen from '../screens/common/SelectOrganizationScreen';
import useAuth from '../hooks/useAuth';

export default function AppNavigator() {
  const { organizationId, role } = useAuth();

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
