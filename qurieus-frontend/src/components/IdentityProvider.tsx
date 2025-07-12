"use client";

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { getIdentityContext, linkVisitorToUser, clearUserLink } from '@/utils/visitorId';
import { identifyIdentity, getCurrentSessionURL } from '@/lib/logrocket';

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    const identityContext = getIdentityContext();
    
    // Always set initial visitor identity when component mounts
    if (identityContext.visitorId) {
      identifyIdentity(identityContext.visitorId, undefined, {
        name: 'Anonymous Visitor'
      });
    }
  }, []); // Run only once on mount

  useEffect(() => {
    const identityContext = getIdentityContext();
    
    if (status === 'authenticated' && session?.user?.id) {
      // Only update if user ID has changed
      if (lastUserId.current !== session.user.id) {
        lastUserId.current = session.user.id;
        
        // Link visitor to user when authenticated
        linkVisitorToUser(session.user.id);
        
        // Update LogRocket identity to user
        identifyIdentity(identityContext.visitorId, session.user.id, {
          name: session.user.name || 'Authenticated User',
          email: session.user.email || undefined
        });
        
        // Log the session URL for debugging
        setTimeout(() => {
          getCurrentSessionURL().then(sessionURL => {
            if (sessionURL) {
              console.log('LogRocket Session URL after login:', sessionURL);
            }
          });
        }, 1000);
      }
    } else if (status === 'unauthenticated') {
      // Only update if we were previously authenticated
      if (lastUserId.current !== null) {
        lastUserId.current = null;
        
        // Clear user link when logged out
        clearUserLink();
        
        // Update LogRocket identity back to visitor
        identifyIdentity(identityContext.visitorId, undefined, {
          name: 'Anonymous Visitor'
        });
      }
    }
  }, [status, session?.user?.id]);

  return <>{children}</>;
} 