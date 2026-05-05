import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner, SpinnerSize, Stack } from '@fluentui/react';
import { useUser } from '../../contexts/UserContext';

interface IProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children }) => {
  const { isAdmin, isInitialLoading } = useUser();

  if (isInitialLoading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: 200 } }}>
        <Spinner size={SpinnerSize.large} />
      </Stack>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
