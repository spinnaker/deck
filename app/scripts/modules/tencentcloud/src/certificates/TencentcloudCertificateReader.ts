import { IPromise } from 'angular';
import { groupBy, sortBy } from 'lodash';

import { AccountService, CertificateReader } from '@spinnaker/core';
import { ITencentcloudCertificate } from 'tencentcloud/domain';

export class TencentcloudCertificateReader {
  public static listCertificates(): IPromise<{ [accountId: string]: ITencentcloudCertificate[] }> {
    return CertificateReader.listCertificatesByProvider('tencentcloud').then(
      (certificates: ITencentcloudCertificate[]) => {
        // This account grouping should really go into clouddriver but since it's not, put it here for now.
        return AccountService.listAllAccounts('tencentcloud').then(allAccountDetails => {
          const accountIdToName = allAccountDetails.reduce((acc, accountDetails) => {
            acc[accountDetails.accountId] = accountDetails.name;
            return acc;
          }, {} as { [id: string]: string });

          const sortedCertificates = sortBy(certificates, 'serverCertificateName');
          return groupBy(sortedCertificates, cert => {
            const [, , , , accountId] = cert.arn.split(':');
            return accountIdToName[accountId] || 'unknown';
          });
        });
      },
    );
  }
}
