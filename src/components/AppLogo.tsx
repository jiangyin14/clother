import React from 'react';
import Image from 'next/image'; // Import Next.js Image component
import clotherIcon from '@/assets/banner.png'; // Import the image

const AppLogo = () => {
  return (
    <div className="flex items-center space-x-2">
      {/* Replace text with the Image component */}
      <Image src={clotherIcon} alt="Clother Icon" width={240} height={32} />
    </div>
  );
};

export default AppLogo;
