'use client';

import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useParams as useNextParams,
} from 'next/navigation';

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to?: string;
  href?: string;
  replace?: boolean;
  scroll?: boolean;
  children?: React.ReactNode;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, href, replace, scroll = true, children, className, ...rest }, ref) => {
    const target = (to || href || '#') as string;
    return (
      <NextLink
        ref={ref}
        href={target}
        replace={replace}
        scroll={scroll}
        className={className}
        {...rest}
      >
        {children}
      </NextLink>
    );
  }
);
Link.displayName = 'Link';

export const NavLink = React.forwardRef<HTMLAnchorElement, LinkProps & { activeClassName?: string }>(
  ({ to, href, className, activeClassName = 'active', ...rest }, ref) => {
    const target = (to || href || '') as string;
    const pathname = useNextPathname();
    const isActive = pathname === target || (target !== '/' && pathname?.startsWith(target));
    const combinedClassName = `${className || ''} ${isActive ? activeClassName : ''}`.trim();

    return <Link ref={ref} to={target} className={combinedClassName} {...rest} />;
  }
);
NavLink.displayName = 'NavLink';

let memoryNavState: any = null;

export function useNavigate() {
  const router = useNextRouter();

  return useCallback(
    (to: string | number, options?: { replace?: boolean; state?: any }) => {
      if (typeof to === 'number') {
        if (to === -1) {
          router.back();
        }
        return;
      }
      if (options?.state !== undefined) {
        memoryNavState = options.state;
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem('__driveease_nav_state__', JSON.stringify(options.state));
          } catch {}
        }
      }
      if (options?.replace) {
        router.replace(to);
      } else {
        router.push(to);
      }
    },
    [router]
  );
}

export function useLocation() {
  const pathname = useNextPathname() || '/';
  const [search, setSearch] = useState('');
  const [hash, setHash] = useState('');
  const [state, setState] = useState<any>(() => {
    if (memoryNavState !== null) return memoryNavState;
    if (typeof window !== 'undefined') {
      try {
        const stored = window.sessionStorage.getItem('__driveease_nav_state__');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearch(window.location.search);
      setHash(window.location.hash);
      if (memoryNavState !== null) {
        setState(memoryNavState);
      } else {
        try {
          const stored = window.sessionStorage.getItem('__driveease_nav_state__');
          if (stored) {
            setState(JSON.parse(stored));
          }
        } catch {}
      }
    }
  }, [pathname]);

  return useMemo(
    () => ({
      pathname,
      search: typeof window !== 'undefined' ? window.location.search : search,
      hash: typeof window !== 'undefined' ? window.location.hash : hash,
      state,
      key: 'default',
    }),
    [pathname, search, hash, state]
  );
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (params: URLSearchParams | Record<string, string | number | boolean | undefined | null>) => void
] {
  const router = useNextRouter();
  const pathname = useNextPathname();
  const [currentParams, setCurrentParams] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentParams(new URLSearchParams(window.location.search));
    }
  }, [pathname]);

  const setSearchParams = useCallback(
    (newParams: URLSearchParams | Record<string, string | number | boolean | undefined | null>) => {
      let qs = '';
      if (newParams instanceof URLSearchParams) {
        qs = newParams.toString();
      } else {
        const p = new URLSearchParams();
        Object.entries(newParams).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            p.set(k, String(v));
          }
        });
        qs = p.toString();
      }
      const current = pathname || '';
      const target = qs ? `${current}?${qs}` : current;
      router.replace(target, { scroll: false });
      if (typeof window !== 'undefined') {
        setCurrentParams(new URLSearchParams(qs));
      }
    },
    [router, pathname]
  );

  return [currentParams, setSearchParams];
}

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace = true }) => {
  const router = useNextRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);

  return null;
};

export const Outlet: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const Routes: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const Route: React.FC<{ path?: string; element?: React.ReactNode }> = ({ element }) => {
  return <>{element}</>;
};
