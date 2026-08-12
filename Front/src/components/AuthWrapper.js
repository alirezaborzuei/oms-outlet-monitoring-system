'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { reauthenticate, deauthenticate } from '@/lib/store/authSlice';
import { getCookie } from '@/lib/utils/cookie';
import { decodeToken } from '@/lib/utils/decodeToken';

const AuthWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname(); // استفاده از usePathname برای گرفتن مسیر فعلی
  const { isAuthenticated, role } = useSelector((state) => state.auth) || {};

  // صفحات مجاز برای هر نقش
  const rolePages = {
    LDAPUser: ['/listSupervisor','/attachment','/details','/photos','/photo','DistCode','/customer'],
    RSM: ['/listSupervisor','/attachment','/details','/photos','/photo','DistCode','/customer'],
    ASM: ['/listSupervisor','/attachment','/details','/photos','/photo','DistCode','/customer'],
    Visitor: ['/listVisitor', '/photo', '/detail','/addVisit','/user'],
    Specialist: ['/listSpecialist','/attachment','/details','/photos','DistCode','/customer'],
    Admin: ['/test','/DistCode','/listVisitor','/attachment','/detail','/details','/photos','/photo','/customer','/Allattachment'],
  };

  // Fetch and verify token on initial load
  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      try { 
        const decodedToken = decodeToken(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          dispatch(deauthenticate());
          router.push('/login');
        } else {
          dispatch(reauthenticate(token));
        }
      } catch (err) {
        console.error('Invalid token:', err);
        dispatch(deauthenticate());
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [dispatch, router]);

  // Redirect based on role and path
  useEffect(() => {
    if (isAuthenticated && role) {
      const allowedPages = rolePages[role] || [];
      const isAllowed = allowedPages.some(page => pathname.startsWith(page));
    
     // console.log(`Current pathname: ${pathname}`); // برای بررسی مسیر فعلی
    
      if (!isAllowed) {
        if (role === 'LDAPUser' ||role === 'RSM' ||  role === 'ASM' ) {
          router.push('/DistCode'); 
        }
        if (role === 'Visitor') {
          router.push('/listVisitor');
        } 
        if (role === 'Specialist'|| role==='Admin'|| role==='RSM'|| role==='ASM') {
          router.push('/DistCode');
        }
      }
    }
  },);
 // }, [isAuthenticated, role, pathname, router]);

  return <>{children}</>;
};

export default AuthWrapper;