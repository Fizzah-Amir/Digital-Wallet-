import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const person_type = localStorage.getItem('person_type');
    const name = localStorage.getItem('name');
    const person_id = localStorage.getItem('person_id');

    if (token) {
      setUser({ token, person_type, name, person_id });
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('person_type', data.person_type);
    localStorage.setItem('name', data.name);
    localStorage.setItem('person_id', data.person_id);
    setUser({
      token: data.access,
      person_type: data.person_type,
      name: data.name,
      person_id: data.person_id,
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
