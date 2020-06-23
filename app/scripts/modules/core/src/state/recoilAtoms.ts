import { atom } from 'recoil';
import { CollapsibleSectionStateCache } from '../cache/CollapsibleSectionStateCache';

export const verticalNavExpandedAtom = atom({
  key: 'verticalNavExpanded',
  default: !CollapsibleSectionStateCache.isSet('verticalNav') || CollapsibleSectionStateCache.isExpanded('verticalNav'),
});
