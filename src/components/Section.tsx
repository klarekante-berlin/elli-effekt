import React from 'react';
import '../styles/Section.css';

interface SectionProps {
  children: React.ReactNode;
  color?: string;
  height?: string;
  id?: string;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ 
  children, 
  color = 'transparent', 
  height = '100vh',
  id,
  className = ''
}) => {
  return (
    <section
      id={id}
      className={`section ${className}`}
      style={{
        backgroundColor: color,
        minHeight: height,
      }}
    >
      <div className="section-content">
        {children}
      </div>
    </section>
  );
};

export default Section; 