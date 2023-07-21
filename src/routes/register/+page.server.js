import { AuthApiError } from '@supabase/supabase-js'
import { fail } from '@sveltejs/kit'

export const actions = {
    register: async ({ request, url, locals: { supabase } }) => {
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

        if(error){
            if(error instanceof AuthApiError && error.status === 400){
                return fail(400, {
                    message: "Invalid email or password",
                    success: false
                })
            }
            return fail(500, { message: 'Server error. Try again later.', success: false, email })
        }

        return {
            success: true,
        }
    }
}