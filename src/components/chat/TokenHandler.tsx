'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import type React from "react";
export default function TokenHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  useEffect(() => {
    // console.log("TokenHandler useEffect triggered");
    // console.log("Session:", session);
    if (session?.accessToken) {
      const token = session.accessToken as string;
      // console.log("Access Token:", token);
      // console.log("Current localStorage token:", localStorage.getItem('auth-token'));
      if (token && localStorage.getItem('auth-token') !== token) {
        localStorage.setItem('auth-token', token);
        // console.log("Token set in localStorage:", token);
      } else {
        console.log("Token not set: either token is null/undefined or localStorage token is already the same.");
      }
    } else {
      // console.log("No session or accessToken found.");
    }
  }, [session]);

  return null; // This component does not render anything
}
