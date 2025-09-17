import type {
  AuthChangeEvent,
  Session,
  User,
} from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export const signInWithPassword = async (
  email: string,
  password: string,
) => {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const getSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return data.user;
};

export const onAuthStateChange = (
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);

  return () => {
    subscription.unsubscribe();
  };
};
