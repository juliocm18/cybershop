import {createContext, useContext, useEffect, useState} from "react";
import {supabase} from "../supabase";
import {Session} from "@supabase/supabase-js";
import {User} from "../user/model";
import { setCrashlyticsUserId, setCrashlyticsAttribute, logError } from '../config/firebase';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {data, error} = await supabase.auth.getSession();
      if (error) {
        console.error(error);
        logError(error, 'fetchSession');
      }
      setSession(data.session);
      
      // Set user ID in Crashlytics if session exists
      if (data.session?.user) {
        setCrashlyticsUserId(data.session.user.id);
        setCrashlyticsAttribute('user_email', data.session.user.email || 'unknown');
      }
      
      setLoading(false);
    };

    fetchSession();

    const {data: authListener} = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        
        // Update Crashlytics user info on auth state change
        if (session?.user) {
          setCrashlyticsUserId(session.user.id);
          setCrashlyticsAttribute('user_email', session.user.email || 'unknown');
        } else {
          // Clear user info on sign out
          setCrashlyticsUserId('anonymous');
          setCrashlyticsAttribute('user_email', 'none');
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Set user info in Crashlytics
      setCrashlyticsUserId(data.user.id);
      setCrashlyticsAttribute('user_email', data.user.email || 'unknown');
      setCrashlyticsAttribute('last_sign_in', new Date().toISOString());

      return {
        id: data.user.id,
        email: data.user.email || "noemail@mail.com",
        email_confirmed_at: data.user.email_confirmed_at,
        last_sign_in_at: data.user.last_sign_in_at,
        phone: data.user.phone,
        //role: data.user.role,
      };
    } catch (error: any) {
      logError(error, 'signIn');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const {error} = await supabase.auth.signUp({email, password});
      if (error) throw error;
      
      setCrashlyticsAttribute('last_action', 'signUp');
    } catch (error: any) {
      logError(error, 'signUp');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Remove all Supabase realtime channels to prevent memory leaks
      const allChannels = supabase.getChannels();
      allChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      
      // Sign out from Supabase (this clears the session from storage)
      const { error } = await supabase.auth.signOut();
      if (error) {
        // If the error is that session is already missing, that's fine
        if (error.message !== 'Auth session missing!') {
          console.error('Error during sign out:', error);
          logError(error, 'signOut');
        }
      }
      
      // Clear Crashlytics user info
      setCrashlyticsUserId('anonymous');
      setCrashlyticsAttribute('user_email', 'none');
      
      // Always set session to null, regardless of errors
      setSession(null);
    } catch (error: any) {
      console.error('Error in signOut:', error);
      logError(error, 'signOut');
      // Even if there's an error, clear the local session
      setSession(null);
      // Don't throw the error if it's just a missing session
      if (error.message !== 'Auth session missing!') {
        throw error;
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://burbitstudio.com/reset-password-mall-cybershop',
      });
      if (error) throw error;
      
      setCrashlyticsAttribute('last_action', 'resetPassword');
    } catch (error: any) {
      logError(error, 'resetPassword');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{session, loading, signIn, signUp, signOut, resetPassword}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  //console.log("🚀 ~ useAuth ~ context:", context)
  return context;
}
