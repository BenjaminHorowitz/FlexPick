import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { validateUsername } from '../lib/usernameValidation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  username: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const displayName = session.user.user_metadata?.display_name;
        setUsername(displayName || null);
      } else {
        setUsername(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const displayName = session.user.user_metadata?.display_name;
          setUsername(displayName || null);
        } else {
          setUsername(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const cleanDisplay = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();

    const validation = validateUsername(cleanDisplay);
    if (!validation.isValid) {
      return { error: { message: validation.error || 'Invalid username' } };
    }

    const loginUser = cleanDisplay.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._-]/g, '');

    if (!loginUser) {
      return { error: { message: 'Display name is invalid' } };
    }

    const { data: emailCheck } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (emailCheck) {
      return { error: { message: 'Email is already registered' } };
    }

    const { data: usernameCheck } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', loginUser)
      .maybeSingle();

    if (usernameCheck) {
      return { error: { message: 'Username is already taken' } };
    }

    const { data: displayNameCheck } = await supabase
      .from('profiles')
      .select('display_name')
      .ilike('display_name', cleanDisplay)
      .maybeSingle();

    if (displayNameCheck) {
      return { error: { message: 'Display name is already taken' } };
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          display_name: cleanDisplay,
          username: loginUser,
          full_name: cleanDisplay,
          name: cleanDisplay,
        },
      },
    });

    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
    // Clear local state regardless of API response
    setSession(null);
    setUser(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, username, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
