import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit'

export const handle = async ({ event, resolve }) => {
  // createSupabaseLoadClient caches the client when running in a
  // browser environment and therefore does not create a new client
  // for every time the load function run
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event
  });

  event.locals.getSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();
    return session;
  };

  const userNotAllowed = ['/login', '/'];
  if (userNotAllowed.includes(event.url.pathname)) {
    const session = await event.locals.getSession();
    if (session) {
      throw redirect(303, '/dashboard');
    }
  }

  const adminPath = '/dashboard/settings/manage-users'
  if (event.url.pathname === adminPath || (event.url.pathname === adminPath && event.request.method === 'POST')) {
    const session = await event.locals.getSession();
    if (session?.user.role != 'ADMIN') {
      throw redirect(303, '/dashboard/settings/profile');
    }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    }
  });
};
