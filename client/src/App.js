import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HabitProvider } from './contexts/HabitContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AuthContainer from './components/Auth/AuthContainer';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

function App() {
  const router = createBrowserRouter([
    {
      path: "/auth",
      element: <AuthContainer />
    },
    {
      path: "/",
      element: (
        <PrivateRoute>
          <>
            <Navbar />
            <main className="main-content">
              <Home />
            </main>
          </>
        </PrivateRoute>
      )
    },
    {
      path: "/dashboard",
      element: (
        <PrivateRoute>
          <>
            <Navbar />
            <main className="main-content">
              <Dashboard />
            </main>
          </>
        </PrivateRoute>
      )
    }
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  });

  return (
    <AuthProvider>
      <HabitProvider>
        <RouterProvider router={router} />
      </HabitProvider>
    </AuthProvider>
  );
}

export default App;
