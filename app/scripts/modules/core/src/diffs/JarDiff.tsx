import * as React from 'react';

export interface IJarDiffItem {
  displayDiff: string;
}

export interface IJarDiff {
  [key: string]: IJarDiffItem[];
  added: IJarDiffItem[];
  downgraded: IJarDiffItem[];
  duplicates: IJarDiffItem[];
  removed: IJarDiffItem[];
  unchanged: IJarDiffItem[];
  unknown: IJarDiffItem[];
  upgraded: IJarDiffItem[];
}

export interface IJarDiffProps {
  jarDiffs: IJarDiff;
}

export interface IJarDiffTableProps {
  heading: string;
  jars: IJarDiffItem[];
}

export const JarDiffTable = ({ heading, jars }: IJarDiffTableProps) => (
  <table className="table table-condensed no-lines">
    <tr>
      <th>{heading}</th>
    </tr>
    {jars.map((jar) => (
      <tr>
        <td>{jar.displayDiff}</td>
      </tr>
    ))}
  </table>
);

export const JarDiff = ({ jarDiffs }: IJarDiffProps) => {
  const hasJarDiffs = Object.keys(jarDiffs).some((key: string) => jarDiffs[key].length > 0);

  if (!hasJarDiffs) {
    return null;
  }

  return (
    <div>
      {Boolean(jarDiffs.added?.length) && <JarDiffTable heading="Added" jars={jarDiffs.added} />}
      {Boolean(jarDiffs.removed?.length) && <JarDiffTable heading="Removed" jars={jarDiffs.removed} />}
      {Boolean(jarDiffs.upgraded?.length) && <JarDiffTable heading="Upgraded" jars={jarDiffs.upgraded} />}
      {Boolean(jarDiffs.downgraded?.length) && <JarDiffTable heading="Downgraded" jars={jarDiffs.downgraded} />}
      {Boolean(jarDiffs.duplicates?.length) && <JarDiffTable heading="Duplicates" jars={jarDiffs.duplicates} />}
      {Boolean(jarDiffs.unknown?.length) && <JarDiffTable heading="Unknown" jars={jarDiffs.unknown} />}
    </div>
  );
};
