'use client'
import React from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Component() {
    const { data: session} = useSession();

    if(session){
        <>
            Signed in as {session.user.email}<br/>
        </>
    }

    return (
        <>
            Not signed in <br/>
            <button className='bg-orange-500 rounded px-3 py-1 m-4' onClick={() => signIn()}>Sign In</button>
        </>
    )
}
