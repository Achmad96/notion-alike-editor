'use client';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';
import { NovelConfigType } from '@/GlobalTypes';

export type NovelConfigContextType = [NovelConfigType, Dispatch<SetStateAction<NovelConfigType>>];
export const NovelConfigContext = createContext<[NovelConfigType, Dispatch<SetStateAction<NovelConfigType>>] | null>(null);
export const NovelConfigContextProvider = ({ children }: { children: ReactNode }) => {
  const [novelConfig, setNovelConfig] = useState<NovelConfigType>({
    model: 'Sao10K/L3.3-70B-Euryale-v2.3',
    prompt: '',
    temperature: 0.7,
    max_tokens: 150,
    top_p: 0.9,
    frequency_penalty: 0.5,
    presence_penalty: 0.0
  });
  return <NovelConfigContext.Provider value={[novelConfig, setNovelConfig]}>{children}</NovelConfigContext.Provider>;
};

export const useNovelConfig = () => {
  return useContext(NovelConfigContext) as NovelConfigContextType;
};
