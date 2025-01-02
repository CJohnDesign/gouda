import Image from 'next/image';

export function Corners() {
  return (
    <div className="z-[0] fixed inset-0 pointer-events-none">
      <div className="fixed top-0 left-0">
        <Image src="/images/border-tl.png" alt="Top Left" height={150} width={150} />
      </div>
      <div className="fixed top-0 right-0">
        <Image src="/images/border-tr.png" alt="Top Right" height={150} width={150} />
      </div>
      <div className="fixed bottom-0 left-0">
        <Image src="/images/border-bl.png" alt="Bottom Left" height={150} width={150} />
      </div>
      <div className="fixed bottom-0 right-0">
        <Image src="/images/border-br.png" alt="Bottom Right" height={150} width={150} />
      </div>
    </div>
  );
} 
