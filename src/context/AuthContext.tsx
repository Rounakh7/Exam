import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../utils/storage';

/** Same username always gets the same id, so the same account works across devices. */
function getUserIdForUsername(username: string): string {
  let h = 0;
  const s = username.trim().toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `user-${Math.abs(h).toString(36)}`;
}

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
      u => u.username.toLowerCase().trim() === username.toLowerCase().trim() && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      storage.setCurrentUser(foundUser);
      return true;
    }

    // Same account on another device: user not in this device's storage. Create them locally
    // so the same username/password works everywhere (deterministic id for consistency).
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return false;

    const newUser: User = {
      id: getUserIdForUsername(trimmedUsername),
      username: trimmedUsername,
      password,
      role: 'student',
      completedCourses: []
    };
    storage.saveUsers([...users, newUser]);
    setUser(newUser);
    storage.setCurrentUser(newUser);
    return true;
  };

  const register = (username: string, password: string, role: UserRole): boolean => {
    const users = storage.getUsers();
    const normalized = username.trim().toLowerCase();
    if (users.some(u => u.username.toLowerCase().trim() === normalized)) {
      return false;
    }

    const newUser: User = {
      id: getUserIdForUsername(username.trim()),
      username: username.trim(),
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
