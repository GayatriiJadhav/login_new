import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');

  useEffect(() => {
    // Check if the user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      // Set authenticated state to true if token exists
      setAuthenticated(true);
    } else {
      // Redirect to login page if token does not exist
      window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    setLogoutMessage('Successfully logged out!');
    window.location.href = '/login';
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {logoutMessage && <p>{logoutMessage}</p>}
      {authenticated && (
        <div>
          <p>Welcome to the dashboard!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
