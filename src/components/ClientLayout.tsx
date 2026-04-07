'use client';

import { Sidebar } from './Sidebar';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="transition-all duration-300 md:ml-[220px]">
        {children}
      </div>
    </>
  );
}
