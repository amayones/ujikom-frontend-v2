import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { router } from './router';

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;