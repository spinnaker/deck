import React from 'react';

import { Spinner } from 'core/widgets';

export const Loading = ({ message }: { message: string }) => {
  return (
    <div style={{ width: '100%' }}>
      <Spinner size="medium" message={message} />
    </div>
  );
};
