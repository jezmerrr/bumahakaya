"use client";

import { createContext, useContext } from "react";

// App-level navigation that deep components (a post's details page) need,
// provided by AppShell. Empty outside the app shell (e.g. in tests).
export interface AppNav {
  // Switch to the Maps tab with this report or sensor selected.
  showOnMap?: (reportId: string) => void;
}

export const NavContext = createContext<AppNav>({});

export function useAppNav(): AppNav {
  return useContext(NavContext);
}
