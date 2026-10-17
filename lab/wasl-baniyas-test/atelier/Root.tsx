import React from 'react';
import {Composition} from 'remotion';
import {Scene} from './Composition';

export const Root: React.FC = () => (
  <Composition
    id="TacticWaslBaniyas"
    component={Scene}
    durationInFrames={1500}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={{}}
  />
);
