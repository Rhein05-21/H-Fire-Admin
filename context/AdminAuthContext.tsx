import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { supabase } from '@/utils/supabase';

export type AdminRole = 'admin' | 'hoa' | 'guard' | 'resident' | null;

interface AdminAuthContextType {
  role: AdminRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  verifySignUp: (code: string) => Promise<{ success: boolean; error?: string }>;
  prepareResetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  completeResetPassword: (code: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  user: any;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: authLoaded, userId, signOut } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp: clerkSignUp, isLoaded: signUpLoaded } = useSignUp();
  
  const [role, setRole] = useState<AdminRole>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (userLoaded && user) {
        setIsCheckingAdmin(true);
        try {
          // Check Supabase profiles table by email
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin, email, name, role')
            .eq('email', user.primaryEmailAddress?.emailAddress)
            .single();

          // Sync Clerk info to Supabase (Upsert)
          const clerkEmail = user.primaryEmailAddress?.emailAddress;
          if (clerkEmail) {
            // Check if there are ANY profiles at all
            const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const isFirstUser = count === 0;

            await supabase
              .from('profiles')
              .upsert({ 
                id: user.id, 
                email: clerkEmail,
                name: user.fullName || profile?.name || 'Admin User',
                // If it's the first user ever, or already marked admin, keep it. 
                is_admin: isFirstUser ? true : (profile?.is_admin ?? false),
                role: isFirstUser ? 'admin' : (profile?.role ?? 'resident')
              }, { onConflict: 'id' });
          }

          // If the profile exists and is explicitly NOT an admin/hoa/guard, then logout
          const metadataRole = user.publicMetadata.role as AdminRole;
          const dbRole = profile?.role as AdminRole;
          const finalRole = metadataRole || dbRole || (profile?.is_admin ? 'admin' : null);

          // Only force logout if the user is explicitly a standard resident in the DB
          if (profile && profile.role === 'resident' && !profile.is_admin) {
            await signOut();
            setRole(null);
          } else {
            setRole(finalRole || 'admin'); 
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
        } finally {
          setIsCheckingAdmin(false);
        }
      } else {
        setRole(null);
      }
    };

    checkAdminStatus();
  }, [userLoaded, user, signOut]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!signInLoaded) return { success: false, error: 'Sign in not ready.' };
    try {
      // For standard login, check Supabase BEFORE completing Clerk login
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('email', email)
        .single();
      
      const userRole = profile?.role || (profile?.is_admin ? 'admin' : 'resident');
      if (profile && userRole === 'resident') {
        return { success: false, error: "Residents cannot access the Admin Panel." };
      }

      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return { success: true };
      }
      return { success: false, error: 'Incomplete sign in.' };
    } catch (err: any) {
      return { success: false, error: err.errors?.[0]?.message || 'Sign in failed.' };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!signUpLoaded) return { success: false, error: 'Sign up not ready.' };
    try {
      await clerkSignUp.create({ emailAddress: email, password });
      await clerkSignUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.errors?.[0]?.message || 'Sign up failed.' };
    }
  };

  const verifySignUp = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!signUpLoaded || !setActive) return { success: false, error: 'Sign up not ready.' };
    try {
      const result = await clerkSignUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return { success: true };
      }
      return { success: false, error: 'Verification incomplete.' };
    } catch (err: any) {
      return { success: false, error: err.errors?.[0]?.message || 'Verification failed.' };
    }
  };

  const prepareResetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!signInLoaded) return { success: false, error: 'Sign in not ready.' };
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.errors?.[0]?.message || 'Reset failed.' };
    }
  };

  const completeResetPassword = async (code: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!signInLoaded) return { success: false, error: 'Sign in not ready.' };
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return { success: true };
      }
      return { success: false, error: 'Reset incomplete.' };
    } catch (err: any) {
      return { success: false, error: err.errors?.[0]?.message || 'Reset failed.' };
    }
  };

  const logout = async () => {
    await signOut();
  };

  const loading = !authLoaded || !userLoaded;

  return (
    <AdminAuthContext.Provider value={{ 
      role, 
      isAuthenticated: !!userId, 
      login, 
      signUp,
      verifySignUp,
      prepareResetPassword,
      completeResetPassword,
      logout, 
      user,
      loading 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
  return ctx;
}
