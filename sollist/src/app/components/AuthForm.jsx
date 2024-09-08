'use client'
import {Auth} from '@supabase/auth-ui-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthForm() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClientComponentClient(supabaseUrl, supabaseAnonKey)
    
    return (
        <Auth supabaseClient={supabase} 
        view='magic_link'
        showLinks={false}
        providers={[]}
        redirectTo='http://localhost:3000/auth/callback'
        appearance={{ 
            theme: 'dark',
            button: {
                classname:"bg-white text-black"
            },
            input: {
                classname: "bg-white text-black",
            }
         
         }}
        />
    )
}