"use client"
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
export default function TokenHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    console.log("TokenHandler useEffect triggered");
    console.log("Session object in TokenHandler:", session);
    if (session?.accessToken) {
      const token = session.accessToken as string;
      console.log("Access Token found:", token);
      console.log("Current localStorage auth-token:", localStorage.getItem('auth-token'));
      if (token && localStorage.getItem('auth-token') !== token) {
        localStorage.setItem('auth-token', token);
        console.log("Token set in localStorage:", token);
      } else {
        console.log("Token not set: either token is null/undefined or localStorage token is already the same.");
      }
    } else {
      console.log("No session or accessToken found in session object.");
    }
  }, [session]);

  return null; // This component does not render anything
}
