import Image from 'next/image';
import { PolicyBuilder } from '@/components/PolicyBuilder';

export default function Home() {
  return (
    <>
      <header className="flex items-center gap-4 border-b border-cs-border bg-white px-6 py-4">
        <Image
          src="https://www.cloudstaff.com/wp-content/uploads/2023/11/Cloudstaff-Logo-Landscape-Keyline-255x74.png"
          alt="Cloudstaff"
          width={110}
          height={32}
          priority
          unoptimized
        />
        <span className="ml-auto rounded-full bg-cs-bg px-2.5 py-1 text-[11px] uppercase tracking-wider text-cs-muted">
          AI Policy Builder · Free tool
        </span>
      </header>

      <main>
        <PolicyBuilder />
      </main>
    </>
  );
}
