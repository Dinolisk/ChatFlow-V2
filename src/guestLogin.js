import { supabase } from './supabaseClient';

export async function signInAsGuest() {
  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: { username: 'Gäst' },
    },
  });

  if (error) {
    if (error.status === 422 || error.message?.toLowerCase().includes('anonymous')) {
      throw new Error('Anonym inloggning är avstängd i Supabase. Aktivera den under Authentication → Sign In / Providers.');
    }
    throw error;
  }

  const user = data.user;
  localStorage.setItem('username', user?.user_metadata?.username || 'Gäst');
  if (user?.id) localStorage.setItem('userId', user.id);

  return user;
}
