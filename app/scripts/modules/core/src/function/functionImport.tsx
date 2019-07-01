import * as React from 'react';

import { FunctionLists } from 'core/function/functionlist';
import { parseFunctionReturns } from 'core/function/parseFunctionReturns';
const util = require('util');

export class FunctionImport extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Content />
      </div>
    );
  }
}

class Header extends React.Component {
  render() {
    return (
      <div>
        <h1>functions</h1>
      </div>
    );
  }
}

const Content: React.FC = () => {
  const [functions, setFunctions] = React.useState([]);

  React.useEffect(() => {
    // similar to componentDidMount
    fetch('http://localhost:8084/functions')
      .then(resp => resp.json())
      .then(data => {
        const parsedData = parseFunctionReturns(data);
        setFunctions(parsedData);
      })
      .catch(console.log);
  });

  return <FunctionLists result={functions} />;
};
