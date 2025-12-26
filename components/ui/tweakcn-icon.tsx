import * as React from "react";

export function TweakcnIcon({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 122 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <g>
        <circle cx="26" cy="26" r="25" fill="#fff" fillOpacity="0.08" />
        <path d="M18 34L34 18" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="26" cy="26" r="6" fill="#fff" />
      </g>
    </svg>
  );
}
