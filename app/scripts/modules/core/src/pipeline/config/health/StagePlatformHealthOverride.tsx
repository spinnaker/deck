import { Application } from 'core';

export interface IStagePlatformHealthOverrideProps {
  application: Application;
  stage: Object;
  platformHealthType: string;
}
