import * as React from 'react';

interface IFunctionListProps {
  result: {
    name: String;
    region: [
      {
        name: String;
        functions: [Function];
      },
    ];
  }[];
}

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

export const FunctionLists: React.FC<IFunctionListProps> = ({ result }) => {
  return (
    <div>
      <h1>Function List by</h1>
      {result.map(f => (
        <div>
          <h1>{f.name}</h1>
          {f.region.map(region => (
            <div>
              <h2>{region.name}</h2>
              {region.functions.map(func => (
                <div>
                  <p>{func.functionName}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
