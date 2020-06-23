import { MutableSnapshot } from 'recoil';

import * as atoms from './recoilAtoms';
import { CollapsibleSectionStateCache } from '../cache/CollapsibleSectionStateCache';

export const initializeRecoilState = ({ set }: MutableSnapshot): void => {
  set(
    atoms.verticalNavExpandedAtom,
    !CollapsibleSectionStateCache.isSet('verticalNav') || CollapsibleSectionStateCache.isExpanded('verticalNav'),
  );
};
