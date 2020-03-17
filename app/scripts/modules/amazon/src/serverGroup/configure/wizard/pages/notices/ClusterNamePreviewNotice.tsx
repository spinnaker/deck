import React from 'react';

import { IServerGroup } from '@spinnaker/core';

interface IClusterNamePreviewProps {
  createsNewCluster: boolean;
  latestServerGroup: IServerGroup;
  mode: string;
  namePreview: string;
  navigateToLatestServerGroup: () => void;
  showPreviewAsWarning: boolean;
}
export default function ClusterNamePreview({
  createsNewCluster,
  latestServerGroup,
  mode,
  namePreview,
  navigateToLatestServerGroup,
  showPreviewAsWarning,
}: IClusterNamePreviewProps) {
  return (
    <div className="form-group">
      <div className="col-md-12">
        <div className={`well-compact ${showPreviewAsWarning ? 'alert alert-warning' : 'well'}`}>
          <h5 className="text-center">
            <p>Your server group will be in the cluster:</p>
            <p>
              <strong>
                {namePreview}
                {createsNewCluster && <span> (new cluster)</span>}
              </strong>
            </p>
            {!createsNewCluster && mode === 'create' && latestServerGroup && (
              <div className="text-left">
                <p>There is already a server group in this cluster. Do you want to clone it?</p>
                <p>
                  Cloning copies the entire configuration from the selected server group, allowing you to modify
                  whichever fields (e.g. image) you need to change in the new server group.
                </p>
                <p>
                  To clone a server group, select "Clone" from the "Server Group Actions" menu in the details view of
                  the server group.
                </p>
                <p>
                  <a className="clickable" onClick={navigateToLatestServerGroup}>
                    Go to details for {latestServerGroup.name}
                  </a>
                </p>
              </div>
            )}
          </h5>
        </div>
      </div>
    </div>
  );
}
