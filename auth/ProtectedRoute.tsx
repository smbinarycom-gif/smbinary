import React from 'react';
import { ReactNode } from 'react';
import useAuth from './useAuth';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children, fallback = null }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{padding:20,textAlign:'center',color:'#fff'}}>Loading…</div>;
  if (!user) return <>{fallback}</>;
  return <>{children}</>;
};

export default ProtectedRoute;
