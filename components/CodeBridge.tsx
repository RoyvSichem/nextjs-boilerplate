'use client';
import { useEffect } from 'react';

export default function CodeBridge(){
  useEffect(()=>{
    const p = new URLSearchParams(location.search);
    const code = p.get('code');
    if(code) location.href = `/auth/callback?code=${code}`;
  },[]);
  return null;
}
