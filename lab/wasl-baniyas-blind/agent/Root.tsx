import React from 'react';
import {Composition} from 'remotion';
import {BlindMatchFilm} from './Composition';

export const Root: React.FC = () => {
  return (
    <Composition
      id="TacticBlindWaslBaniyas"
      component={BlindMatchFilm}
      durationInFrames={1500}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
