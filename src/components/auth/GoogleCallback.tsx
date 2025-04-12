
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast({
      title: 'Authentication method changed',
      description: 'Google authentication is no longer supported. Please use email and password.',
      variant: 'destructive'
    });
    
    navigate('/auth');
  }, [navigate]);

  return null;
};
