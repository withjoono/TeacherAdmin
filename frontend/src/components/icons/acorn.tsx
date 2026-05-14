import React from "react";

interface AcornProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const Acorn: React.FC<AcornProps> = ({
  className,
  style,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...props}
    >
      <path d="M4 10h16v2a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4v-2z" />
      <path d="M6 10V8a6 6 0 0 1 12 0v2" />
      <path d="M12 2v2" />
      <path d="M8 10h8" />
      <path d="M5.5 16C5.5 19.5 8.5 22 12 22C15.5 22 18.5 19.5 18.5 16" />
    </svg>
  );
};

export default Acorn;
