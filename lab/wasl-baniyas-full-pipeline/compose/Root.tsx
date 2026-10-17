import React from 'react';
import {Composition} from 'remotion';
import {TacticMatchPulse} from './TacticMatchPulse';

export const Root: React.FC = () => (
  <Composition id="TacticMatchPulse" component={TacticMatchPulse} durationInFrames={1500} fps={30} width={1080} height={1920} />
);
