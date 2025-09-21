'use client';
import { useEffect } from 'react';
import { supabaseBrowser } from '../../lib/supabase-browser';

export default function Logout(){
  useEffect(()=>{ supabaseBrowser().auth.signOut().then(()=>{ window.location.href='/' }); },[]);
  return <main style={{maxWidth:560, margin:'40px auto', padding:'0 16px'}}><p>Uitloggen…</p></main>;
}
