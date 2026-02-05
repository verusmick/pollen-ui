'use client';

import { createContext, useContext } from 'react';

export const SidebarContext = createContext({ sidebarWidth: 0 });

export const useSidebar = () => useContext(SidebarContext);
