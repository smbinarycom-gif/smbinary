import React from 'react';
import UserAuthScreen from '../auth/UserAuthScreen';
import { useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (mode: 'LOGIN' | 'SIGNUP', payload: any) => {
    if (mode === 'LOGIN') {
      const ok = await auth.signIn({ email: payload.email, password: payload.password });
      if (ok) navigate('/trade');
    }
  };

  return <UserAuthScreen onSubmit={handleSubmit} embedded={false} initialMode="LOGIN" />;
};

export default LoginPage;
