import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Tabs as AntdTabs, Tooltip} from 'antd';

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
        item.label = (
            <Tooltip key={title} title={title}>
              <FontAwesomeIcon icon={icon} size="lg" />
            </Tooltip>
        )
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

