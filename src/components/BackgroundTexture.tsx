import React, { useEffect, useState, memo } from 'react';
import '../styles/BackgroundTexture.css';

const BackgroundTexture: React.FC = memo(() => {
  const [textures, setTextures] = useState<{ dust: string; overall: string } | null>(null);

  useEffect(() => {
    const loadTextures = async () => {
      try {
        const [dustModule, overallModule] = await Promise.all([
          import('../assets/textures/texture_dust.png'),
          import('../assets/textures/texture_overall.png')
        ]);
        
        setTextures({
          dust: dustModule.default,
          overall: overallModule.default
        });
      } catch (error) {
        console.error('Fehler beim Laden der Texturen:', error);
      }
    };

    loadTextures();
  }, []);

  if (!textures) {
    return null;
  }

  return (
    <div className="background-texture">
      <div 
        className="texture texture-overall" 
        style={{ backgroundImage: `url(${textures.overall})` }}
        aria-hidden="true"
      />
      <div 
        className="texture texture-dust" 
        style={{ backgroundImage: `url(${textures.dust})` }}
        aria-hidden="true"
      />
    </div>
  );
});

BackgroundTexture.displayName = 'BackgroundTexture';

export default BackgroundTexture; 