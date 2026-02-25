import React from 'react';
import UserAuthScreen from '../auth/UserAuthScreen';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const RegisterPage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (mode: 'LOGIN' | 'SIGNUP', payload: any) => {
    if (mode === 'SIGNUP') {
      // pass through all collected fields to signUp so we can persist richer user info
      const ok = await auth.signUp(payload);
      if (ok) navigate('/login');
    }
  };

  return <UserAuthScreen onSubmit={handleSubmit} embedded={false} initialMode="SIGNUP" />;
};

export default RegisterPage;
