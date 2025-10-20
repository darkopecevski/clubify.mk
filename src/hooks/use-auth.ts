"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AuthError {
  message: string;
  status?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const supabase = createClient();

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError({ message: authError.message, status: authError.status });
        return { user: null, error: authError };
      }

      return { user: authData.user, error: null };
    } catch {
      const error = { message: "An unexpected error occurred" };
      setError(error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        setError({ message: authError.message, status: authError.status });
        return { user: null, error: authError };
      }

      return { user: authData.user, error: null };
    } catch {
      const error = { message: "An unexpected error occurred" };
      setError(error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signOut();

      if (authError) {
        setError({ message: authError.message });
        return { error: authError };
      }

      return { error: null };
    } catch {
      const error = { message: "An unexpected error occurred" };
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        }
      );

      if (authError) {
        setError({ message: authError.message });
        return { error: authError };
      }

      return { error: null };
    } catch {
      const error = { message: "An unexpected error occurred" };
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (data: UpdatePasswordData) => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (authError) {
        setError({ message: authError.message });
        return { error: authError };
      }

      return { error: null };
    } catch {
      const error = { message: "An unexpected error occurred" };
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    loading,
    error,
  };
}
