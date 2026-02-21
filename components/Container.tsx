import type { ReactNode } from "react";

const baseClassName = "max-w-6xl mx-auto px-6";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={className ? `${baseClassName} ${className}` : baseClassName}>
      {children}
    </div>
  );
}
