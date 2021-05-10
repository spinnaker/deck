import cx from 'classnames';
import React from 'react';
import './HorizontalTabs.less';

export const TopNav = () => {};

type TabsProps = {
  children: Array<React.ReactElement<TabProps>> | React.ReactElement<TabProps>;
  className?: string;
  style?: React.CSSProperties;
};

export const HorizontalTabs = ({ children, className, style }: TabsProps) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  return (
    <div className={cx(className, 'HorizontalTabs')} style={style}>
      <ul>
        {React.Children.map(children, (item, index) => (
          <TabTitle
            key={index}
            title={item.props.title}
            setSelected={() => setSelectedTab(index)}
            isSelected={index == selectedTab}
          />
        ))}
      </ul>
      {Array.isArray(children) ? children[selectedTab] : children}
    </div>
  );
};

type TabProps = { title: string; className?: string; children: React.ReactNode };

export const Tab = ({ children, className }: TabProps) => {
  return <div className={className}>{children}</div>;
};

interface TabTitleProps {
  title: string;
  isSelected: boolean;
  setSelected: () => void;
}

const TabTitle = ({ title, isSelected, setSelected }: TabTitleProps) => {
  return (
    <li>
      <button onClick={setSelected} className={cx('tab', { 'selected-tab': isSelected })}>
        {title}
      </button>
    </li>
  );
};
