import React from "react";

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center">
        <img
          src="/images/vosaio-logo-2.png"
          alt="AIO Travel Logo"
          className="w-6 h-6 object-contain"
        />
      </div>
      <span className="text-xl font-bold">AIO Travel</span>
    </div>
  );
};

export default Logo;
