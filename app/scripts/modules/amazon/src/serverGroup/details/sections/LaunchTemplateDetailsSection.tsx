import React from 'react';

import { CollapsibleSection, LabeledValue, LabeledValueList, ShowUserData } from '@spinnaker/core';
import { IAmazonServerGroupDetailsSectionProps } from './IAmazonServerGroupDetailsSectionProps';

export const LaunchTemplateDetailsSection = ({ serverGroup }: IAmazonServerGroupDetailsSectionProps) => {
  const { image, launchTemplate, name } = serverGroup;
  const getBaseImage = (description?: string) => {
    let name;
    const tags = (description || '').split(', ');
    tags.forEach((tag: string) => {
      const keyVal = tag.split('=');
      if (keyVal.length === 2 && keyVal[0] === 'ancestor_name') {
        name = keyVal[1];
      }
    });

    return name;
  };

  const baseImage = getBaseImage(image?.description);
  const maxSpotPrice = launchTemplate?.instanceMarketOptions?.spotOptions?.maxPrice;

  if (!launchTemplate) {
    return null;
  }

  return (
    <CollapsibleSection heading="Launch Template">
      <LabeledValueList className="horizontal-when-filters-collapsed">
        <LabeledValue label="Name" value={launchTemplate.launchTemplateName} />
        <LabeledValue label="Image ID" value={launchTemplate.imageId} />
        {image?.imageLocation && <LabeledValue label="Image Name" value={image?.imageLocation} />}
        {baseImage && <LabeledValue label="Base Image Name" value={baseImage} />}
        <LabeledValue label="Instance Type" value={launchTemplate.instanceType} />
        <LabeledValue label="IAM Profile" value={launchTemplate.iamInstanceProfile} />
        <LabeledValue label="Instance Monitoring" value={launchTemplate.monitoring.enabled ? 'enabled' : 'disabled'} />
        {maxSpotPrice && <LabeledValue label="Max Spot Price" value={maxSpotPrice} />}
        {launchTemplate.keyName && <LabeledValue label="Key Name" value={launchTemplate.keyName} />}
        {launchTemplate.kernelId && <LabeledValue label="Kernel ID" value={launchTemplate.kernelId} />}
        {launchTemplate.ramDiskId && <LabeledValue label="Ramdisk ID" value={launchTemplate.ramDiskId} />}
        {launchTemplate.userData && (
          <LabeledValue
            label="User Data"
            value={<ShowUserData serverGroupName={name} userData={launchTemplate.userData} />}
          />
        )}
      </LabeledValueList>
    </CollapsibleSection>
  );
};
