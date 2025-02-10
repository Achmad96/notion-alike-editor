'use client';

import { NovelConfigContextProvider } from '@/hooks/useNovelConfig';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <NovelConfigContextProvider>{children}</NovelConfigContextProvider>;
};
export default Providers;
