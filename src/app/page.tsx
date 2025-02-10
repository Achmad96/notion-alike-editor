import NovelEditor from '@/components/NovelEditor';
import Providers from '@/hooks/Provider';

export default function Home() {
  return (
    <div className="flex items-end justify-center h-auto max-w-full w-full gap-3 pt-1 bg-[#191919]">
      <Providers>
        <NovelEditor />
      </Providers>
    </div>
  );
}
