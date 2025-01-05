import Image from 'next/image';

export function Corners() {
  return (
    <div className="z-[0] fixed inset-0 pointer-events-none">
      <div className="fixed top-0 left-0">
        <Image
          src="/images/border-tl.png"
          alt="Top Left"
          width={50}
          height={50}
          style={{ width: 'auto', height: '50px' }}
        />
      </div>
      <div className="z-[0] fixed top-0 right-0">
        <Image
          src="/images/border-tr.png"
          alt="Top Right"
          width={100}
          height={100}
          style={{ width: 'auto', height: '100px' }}
        />
      </div>
      <div className="z-[0] fixed bottom-0 left-0">
        <Image
          src="/images/border-bl.png"
          alt="Bottom Left"
          width={100}
          height={100}
          style={{ width: 'auto', height: '100px' }}
        />
      </div>
      <div className="z-[0] fixed bottom-0 right-0">
        <Image
          src="/images/border-br.png"
          alt="Bottom Right"
          width={100}
          height={100}
          style={{ width: 'auto', height: '100px' }}
        />
      </div>
    </div>
  );
} 
