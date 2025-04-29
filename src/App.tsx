
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import './App.scss';
import { routes } from '../src/route/Route';

const router = createBrowserRouter(routes);

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default App;
