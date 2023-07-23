import { RealtimeClient } from '@supabase/realtime-js';
import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const realtimeClient = new RealtimeClient('ws://localhost:4000/socket', {
	params: {
		apikey: PUBLIC_SUPABASE_ANON_KEY,
		eventsPerSecond: 10
	}
});

// const channel = realtimeClient.channel('db-changes')

// channel.on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
//   console.log('All changes in public schema: ', payload)
// })

// channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
//   console.log('All inserts in messages table: ', payload)
// })

// channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: 'username=eq.Realtime' }, (payload) => {
//   console.log('All updates on users table when username is Realtime: ', payload)
// })

// channel.subscribe(async (status) => {
//   if (status === 'SUBSCRIBED') {
//     console.log('Ready to receive database changes!')
//   }
// })
