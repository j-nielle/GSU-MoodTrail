# Supabase Auth Helper for SvelteKit

## Creating a Supabase Client

Create a new `hooks.server.js` file in the root of your project and populate with the following:

**src/`hooks.server.js`**
```javascript

// src/hooks.server.js
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event,
  })

  /**
   * a little helper that is written for convenience so that instead
   * of calling `const { data: { session } } = await supabase.auth.getSession()`
   * you just call this `await getSession()`
   */
  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    return session
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    },
  })
}
```
> **INFO**:
> Note that we are specifying *filterSerializedResponseHeaders* here. We need to tell SvelteKit that supabase needs the **content-range header**.

## Code Exchange Route
The **Code Exchange route** is required for the server-side auth flow implemented by the SvelteKit Auth Helpers. It exchanges an auth code for the user's session, which is set as a cookie for future requests made to Supabase.

Create a new file at `src/routes/auth/callback/+server.js` and populate with the following:

```javascript
import { redirect } from '@sveltejs/kit'

export const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  throw redirect(303, '/')
}
```
## Generate types from your database
In order to get the most out of TypeScript and it's intellisense, you should import the generated Database types into the app.d.ts type definition file that comes with your SvelteKit project, where `import('./DatabaseDefinitions')` points to the generated types file outlined in v2 docs here after you have logged in, linked, and generated types through the Supabase CLI.

```javascript
// src/app.d.ts

import { SupabaseClient, Session } from '@supabase/supabase-js'
import { Database } from './DatabaseDefinitions'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      getSession(): Promise<Session | null>
    }
    interface PageData {
      session: Session | null
    }
    // interface Error {}
    // interface Platform {}
  }
}
```
## Authentication
Authentication can be initiated client or server-side. All of the supabase-js authentication strategies are supported with the Auth Helpers client.

> **NOTE**: The authentication flow requires the **Code Exchange Route** to exchange a code for the user's session.

## Client-side
### Send session to client
To make the session available across the UI, including pages and layouts, it is crucial to pass the session as a **parameter** in the root layout's server load function.

```javascript
// src/routes/+layout.server.js
export const load = async ({ locals: { getSession } }) => {
  return {
    session: await getSession(),
  }
}
```
### Shared Load functions and pages
To utilize Supabase in shared load functions and within pages, it is essential to create a Supabase client in the **root layout load function**.

```javascript
// src/routes/+layout.js
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'

export const load = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = createSupabaseLoadClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return { supabase, session }
}
```
### Access the client inside pages by `$page.data.supabase` or `data.supabase` when using `export let data`.

The usage of depends tells sveltekit that this load function should be executed whenever invalidate is called to keep the page store in sync.

**createSupabaseLoadClient** caches the client when running in a browser environment and therefore does not create a new client for every time the load function runs.

## Setting up the event listener on the client side
We need to create an event listener in the root `+layout.svelte` file in order to catch supabase events being triggered.

```javascript
<!-- src/routes/+layout.svelte -->
<script>
  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'

  export let data

  let { supabase, session } = data
  $: ({ supabase, session } = data)

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    })

    return () => subscription.unsubscribe()
  });
</script>

<slot />
```
The usage of invalidate tells SvelteKit that the root `+layout.js` load function should be executed whenever the session updates to keep the page store in sync.

## Sign in / Sign up / Sign out
We can access the supabase instance in our `+page.svelte` file through the data object.
```javascript
<!-- // src/routes/auth/+page.svelte -->
<script>
  export let data
  let { supabase } = data
  $: ({ supabase } = data)

  let email
  let password

  const handleSignUp = async () => {
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const handleSignIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }
</script>

<form on:submit="{handleSignUp}">
  <input name="email" bind:value="{email}" />
  <input type="password" name="password" bind:value="{password}" />
  <button>Sign up</button>
</form>

<button on:click="{handleSignIn}">Sign in</button>
<button on:click="{handleSignOut}">Sign out</button>
```
## Server-side
**Form Actions** can be used to trigger the authentication process from form submissions.
```javascript
// src/routes/login/+page.server.js
import { fail } from '@sveltejs/kit'

export const actions = {
  default: async ({ request, url, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email')
    const password = formData.get('password')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${url.origin}/auth/callback`,
      },
    })

    if (error) {
      return fail(500, { message: 'Server error. Try again later.', success: false, email })
    }

    return {
      message: 'Please check your email for a magic link to log into the website.',
      success: true,
    }
  },
}
```
```javascript

<!-- // src/routes/login/+page.svelte -->
<script>
	import { enhance } from '$app/forms'
	export let form
</script>

<form method="post" use:enhance>
  <input name="email" value={form?.email ?? ''} />
  <input type="password" name="password" />
  <button>Sign up</button>
</form>
```
## Authorization
### Protecting API routes
Wrap an API Route to check that the user has a valid session. If they're not logged in the session is null.

```javascript
// src/routes/api/protected-route/+server.js
import { json, error } from '@sveltejs/kit'

export const GET = async ({ locals: { supabase, getSession } }) => {
  const session = await getSession()
  if (!session) {
    // the user is not signed in
    throw error(401, { message: 'Unauthorized' })
  }
  const { data } = await supabase.from('test').select('*')

  return json({ data })
}
```
> If you visit `/api/protected-route` without a valid session cookie, you will get a 401 response.

## Protecting Actions
Wrap an Action to check that the user has a valid session. If they're not logged in the session is null.
```javascript
// src/routes/posts/+page.server.js
import { error, fail } from '@sveltejs/kit'

export const actions = {
  createPost: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession()

    if (!session) {
      // the user is not signed in
      throw error(401, { message: 'Unauthorized' })
    }
    // we are save, let the user create the post
    const formData = await request.formData()
    const content = formData.get('content')

    const { error: createPostError, data: newPost } = await supabase
      .from('posts')
      .insert({ content })

    if (createPostError) {
      return fail(500, {
        supabaseErrorMessage: createPostError.message,
      })
    }
    return {
      newPost,
    }
  },
}
```
> If you try to submit a form with the action `?/createPost` without a valid session cookie, you will get a 401 error response.

# Protecting multiple routes
To avoid writing the same auth logic in every single route you can use the handle hook to
protect multiple routes at once.

```javascript
// src/hooks.server.js
import { redirect, error } from '@sveltejs/kit'

export const handle = async ({ event, resolve }) => {
  // protect requests to all routes that start with /protected-routes
  if (event.url.pathname.startsWith('/protected-routes')) {
    const session = await event.locals.getSession()
    if (!session) {
      // the user is not signed in
      throw redirect(303, '/')
    }
  }

  // protect POST requests to all routes that start with /protected-posts
  if (event.url.pathname.startsWith('/protected-posts') && event.request.method === 'POST') {
    const session = await event.locals.getSession()
    if (!session) {
      // the user is not signed in
      throw error(303, '/')
    }
  }

  return resolve(event)
}
```
## Data fetching
### Client-side data fetching with RLS
For row level security to work properly when fetching data client-side, you need to use supabaseClient from PageData and only run your query once the session is defined client-side:
```javascript
<!--src/routes/+page.svelte-->
<script>
  export let data

  let loadedData = []
  async function loadData() {
    const { data: result } = await data.supabase.from('test').select('*').limit(20)
    loadedData = result
  }

  $: if (data.session) {
    loadData()
  }
</script>

{#if data.session}
<p>client-side data fetching with RLS</p>
<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
Server-side data fetching with RLS#
src/routes/profile/+page.svelte
```
```javascript
// src/routes/profile/+page.svelte
<script>
  export let data

  let { user, tableData } = data
  $: ({ user, tableData } = data)
</script>

<div>Protected content for {user.email}</div>
<pre>{JSON.stringify(tableData, null, 2)}</pre>
<pre>{JSON.stringify(user, null, 2)}</pre>
src/routes/profile/+page.js
```
```javascript
// src/routes/profile/+page.js
import { redirect } from '@sveltejs/kit'

export const load = async ({ parent }) => {
  const { supabase, session } = await parent()
  if (!session) {
    throw redirect(303, '/')
  }
  const { data: tableData } = await supabase.from('test').select('*')

  return {
    user: session.user,
    tableData,
  }
}
```
## Saving and deleting the session
```javascript
import { fail, redirect } from '@sveltejs/kit'
import { AuthApiError } from '@supabase/supabase-js'

export const actions = {
  signin: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error instanceof AuthApiError && error.status === 400) {
        return fail(400, {
          error: 'Invalid credentials.',
          values: {
            email,
          },
        })
      }
      return fail(500, {
        error: 'Server error. Try again later.',
        values: {
          email,
        },
      })
    }

    throw redirect(303, '/dashboard')
  },

  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    throw redirect(303, '/')
  },
}
```

## Migration Guide 
### Migrate to 0.10
**PKCE Auth Flow**
Proof Key for Code Exchange (PKCE) is the new server-side auth flow implemented by the SvelteKit Auth Helpers. It requires a server endpoint for `/auth/callback` that exchanges an auth code for the user's session.

Check the **Code Exchange Route** steps above to implement this server endpoint.

### Authentication
For authentication methods that have a **redirectTo** or **emailRedirectTo**, this must be set to this new code exchange route handler - `/auth/callback`. This is an example with the signUp function:

```javascript
await supabase.auth.signUp({
  email: 'jon@example.com',
  password: 'sup3rs3cur3',
  options: {
    emailRedirectTo: 'http://localhost:3000/auth/callback',
  },
})

```
### Migrate from 0.8.x to 0.9 
Set up the Supabase client [#migration-set-up-supabase-client]
In version 0.9 we now setup our Supabase client for the server inside of a `hooks.server.js` file.

**0.9.0**
```javascript
// src/lib/db.js
import { createClient } from '@supabase/auth-helpers-sveltekit'
import { env } from '$env/dynamic/public'
// or use the static env

// import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
export const supabaseClient = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY)
```
### Initialize the client [#migration-initialize-client]
In order to use the Supabase library in your client code you will need to setup a shared load function inside the root +layout.js and create a `+layout.svelte` to handle our event listening for Auth events.

0.9.0
```javascript
//<!-- src/routes/+layout.svelte -->
<script>
  import { supabaseClient } from '$lib/db'
  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'

  onMount(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(() => {
      invalidate('supabase:auth')
    })

    return () => {
      subscription.unsubscribe()
    }
  })
</script>

<slot />
```
### Set up hooks [#migration-set-up-hooks]
Since version 0.9 relies on `hooks.server.js` to setup our client, we no longer need the hooks.client.js in our project for Supabase related code.

### Typings [#migration-typings]
```javascript
// src/app.d.ts
import { SupabaseClient, Session } from '@supabase/supabase-js'
import { Database } from './DatabaseDefinitions'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      getSession(): Promise<Session | null>
    }
    interface PageData {
      session: Session | null
    }
    // interface Error {}
    // interface Platform {}
  }
}
```

### Protecting a page [#migration-protecting-a-page]
```javascript
//<!-- src/routes/profile/+page.svelte -->
<script>
  import type { PageData } from './$types'

  export let data: PageData
  $: ({ user, tableData } = data)
</script>

<div>Protected content for {user.email}</div>
<pre>{JSON.stringify(tableData, null, 2)}</pre>
<pre>{JSON.stringify(user, null, 2)}</pre>
```
```javascript
// src/routes/profile/+page.js
import type { PageLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageLoad = async ({ parent }) => {
  const { supabase, session } = await parent()
  if (!session) {
    throw redirect(303, '/')
  }
  const { data: tableData } = await supabase.from('test').select('*')

  return {
    user: session.user,
    tableData,
  }
}
```
### Protecting a API route [#migration-protecting-a-api-route]

```javascript
// src/routes/api/protected-route/+server.js
import type { RequestHandler } from './$types'
import { json, error } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals: { supabase, getSession } }) => {
  const session = await getSession()
  if (!session) {
    // the user is not signed in
    throw error(401, { message: 'Unauthorized' })
  }
  const { data } = await supabase.from('test').select('*')

  return json({ data })
}
```