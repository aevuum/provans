'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  message,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    primary: 'border-[#E5D3B3]',
    secondary: 'border-gray-600',
    white: 'border-white',
    gray: 'border-gray-300'
  };

  const spinner = (
    <div className={`
      animate-spin rounded-full border-b-2 
      ${sizeClasses[size]} 
      ${colorClasses[color]}
      ${className}
    `} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          {message && (
            <p className="mt-4 text-gray-600 text-lg">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {spinner}
      {message && (
        <p className="mt-4 text-gray-600">{message}</p>
      )}
    </div>
  );
}
