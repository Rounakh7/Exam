import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  updateUserCourses: (courseKey: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    storage.initializeDefaultAdmin();
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const users = storage.getUsers();
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      storage.setCurrentUser(foundUser);
      return true;
    }
    return false;
  };

  const register = (username: string, password: string, role: UserRole): boolean => {
    const users = storage.getUsers();

    if (users.some(u => u.username === username)) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      password,
      role,
      completedCourses: []
    };

    storage.saveUsers([...users, newUser]);
    setUser(newUser);
    storage.setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    storage.setCurrentUser(null);
  };

  const updateUserCourses = (courseKey: string) => {
    if (!user) return;

    const users = storage.getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          completedCourses: [...u.completedCourses, courseKey]
        };
      }
      return u;
    });

    storage.saveUsers(updatedUsers);
    const updatedUser = updatedUsers.find(u => u.id === user.id);
    if (updatedUser) {
      setUser(updatedUser);
      storage.setCurrentUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserCourses }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
