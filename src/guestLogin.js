import { supabase } from './supabaseClient';

export async function signInAsGuest() {
  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: { username: 'Gäst' },
    },
  });

  if (error) throw error;

  const user = data.user;
  localStorage.setItem('username', user?.user_metadata?.username || 'Gäst');
  if (user?.id) localStorage.setItem('userId', user.id);

  return user;
}
