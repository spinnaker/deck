interface Function {
  account: String;
  codeSha256: String;
  codeSize: number;
  description: String;
  eventSourceMappings: Array<any>;
  functionArn: String;
  functionName: String;
  functionname: String;
  handler: String;
  lastModified: String;
  layers: Array<any>;
  memorySize: number;
  region: String;
  revisionId: String;
  revisions: any;
  role: String;
  runtime: String;
  timeout: number;
  tracingConfig: {
    mode: String;
  };
  version: String;
}

export const parseFunctionReturns: any = (functionArray: Array<Function>) => {
  const returnArray: Array<any> = [];

  const accountSeen: any = {};
  const accountRegionSeen: any = {};

  functionArray.forEach(element => {
    const account: any = element.account;
    const accountRegion = `${element.account}.${element.region}`;

    if (!(account in accountSeen)) {
      accountSeen[account] = returnArray.length;
      returnArray.push({ name: account, region: [] });
    }

    if (!(accountRegion in accountRegionSeen)) {
      accountRegionSeen[accountRegion] = returnArray[accountSeen[account]].region.length;
      returnArray[accountSeen[account]].region.push({
        name: element.region,
        functions: [],
      });
    }

    returnArray[accountSeen[account]].region[accountRegionSeen[accountRegion]].functions.push(element);
  });

  return returnArray;
};
