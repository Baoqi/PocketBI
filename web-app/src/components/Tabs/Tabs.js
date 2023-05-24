import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tabs as AntdTabs } from 'antd';

function Tabs(props) {
  const {
    activeTab,
    children,
    onTabChange
  } = props;

  const tabItems = [];
  for (let i = 0; i < children.length; i++) {
    if (children[i]) {
      const {
        title,
        icon,
        iconOnly = false
      } = children[i].props;

      let item = {
        label: title,
        key: title,
        children: children[i]
      }

      if (iconOnly) {
        item.label = (<FontAwesomeIcon icon={icon} title={title} size="lg" />)
      }

      tabItems.push(item);
    }
  }
    
  return (
      <AntdTabs
          activeKey={activeTab}
          type="card"
          items={tabItems}
          onChange={onTabChange}
      />
  );
}

export default Tabs;

