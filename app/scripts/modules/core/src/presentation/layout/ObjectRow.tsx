import React from 'react';
// import { Link } from 'react-router-dom';
// import StatusBubble from './StatusBubble';
// import classNames from 'classnames';

import styles from './ObjectRow.module.css';

export const ObjectRow = ({ icon, title }) => {
  const depth = 0;
  return (
    <>
      <div className={styles.ObjectRow} style={getStylesFromDepth(depth)}>
        <div className={styles.leftCol}>
          <i className={`ico icon-${icon}`} />
          <span className={styles.rowTitle}>{title}</span>
        </div>
        <div className={styles.centerCol} style={{ flex: `0 0 ${200 + depth * 16}px` }}>
          {/* {renderStatusBubbles(row.statuses)} */} asdf
        </div>
      </div>
    </>
  );
};
// export const ObjectRow = ({ mockDataKey = '', mockData, currentUrl, getPropsForDrawer, depth = 0 }) => {
//   return (
//     <>
//       {mockData.map((row, index) => (
//         <>
//           <div className={buildRowClasses(row)} style={getStylesFromDepth(depth)}>
//             <Link
//               className={styles.clickableArea}
//               to={`${currentUrl}/${row.url}`}
//               data-mockdatakey={buildMockDataKey(mockDataKey, index)}
//               onClick={getPropsForDrawer}
//             >
//               <div className={styles.leftCol}>
//                 <i className={`ico icon-${row.icon}`}/>
//                 <span className={styles.rowTitle}>{row.title}</span>
//               </div>
//               <div className={styles.centerCol}  style={{flex: `0 0 ${200 + depth*16}px`}}>
//                 {renderStatusBubbles(row.statuses)}
//               </div>
//             </Link>
//             {row.children.length > 0 &&
//             <div className={styles.expand}>
//               <i className="ico icon-collapse"/>
//             </div>
//             }
//             <div className={styles.select}>
//               <i className={`ico icon-checkbox-unchecked`}/>
//             </div>
//           </div>

//           {/* Recursively render children */}
//           {(row.children.length > 0) &&
//           <ObjectRow
//             mockData={row.children}
//             currentUrl={currentUrl}
//             getPropsForDrawer={getPropsForDrawer}
//             depth={depth + 1}
//             mockDataKey={buildMockDataKey(mockDataKey, index) + '.children'}
//           />
//           }
//         </>
//       ))}
//     </>
//   )
// };

const getStylesFromDepth = depth => {
  return {
    marginLeft: 16 * depth,
    position: 'sticky',
    top: 104 + 40 * depth,
    zIndex: 500 - depth,
  };
};

// const renderStatusBubbles = (statuses) => {
//   return (
//     <>
//     {statuses.map((status) => (
//       <StatusBubble
//         level={status.level}
//         icon={status.icon}
//         hoverText={status.hoverText}
//         fullText={status.fullText}
//         qty={status.qty}
//       />
//     ))}
//     </>
//   )
// };

// const buildMockDataKey = (oldMockDataKey, index) => {
//   return `${oldMockDataKey}[${index}]`;
// };

// const buildRowClasses = (row) => {
//   return classNames(styles.ObjectRow, {
//     [styles.active]: row.isActive
//   });
// };

// //TODO

// const Checkbox = ({ selected, label, onChange }) => {
//   return (
//     <div>
//       <div
//         className="checkbox"
//         onClick={() => onChange(!selected)}
//       />
//       <div className="label">{label}</div>
//     </div>
//   )
// };
