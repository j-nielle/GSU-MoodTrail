import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'
import { redirect } from '@sveltejs/kit'

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event,
  })

  event.locals.getSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();
    return session;
  };

  // protect GET requests to for user routes
  // if (event.url.pathname.startsWith('/protected-posts') && event.request.method === 'GET') {
  //   const session = await event.locals.getSession();
  //   if (!session) {
  //     // the user is not signed in
  //     throw error(303, '/');
  //   }
  // }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    }
  });
};