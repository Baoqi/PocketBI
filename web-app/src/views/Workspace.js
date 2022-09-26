import React from 'react';
import { Route, Routes } from "react-router-dom";
import { withTranslation } from 'react-i18next';

import DataSource from './DataSource';
import Report from './Report/Report';
import ReportFullScreenView from './ReportFullScreenView';
import PageNotFound from './PageNotFound';

import { withRouter } from '../components/routing/RouterUtil';
import './Workspace.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MENU_ITEMS = [
  {
    link: '/workspace/report',
    value: 'Report',
    icon: 'chalkboard',
  }, 
  {
    link: '/workspace/datasource',
    value: 'Data Source',
    icon: 'database'
  }
];

class Workspace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMenuLink: '/workspace/report',
      menutItems: MENU_ITEMS
    }
  }

  componentDidMount() {
    const pathname = this.props.location.pathname;
    let link = '';
    const { menutItems } = this.state;
    const index = menutItems.findIndex(m => pathname.startsWith(m.link));
    if (index !== -1) {
      link = menutItems[index].link;
    }

    this.setState({
      currentMenuLink: link,
    });
  }

  handleMenuClick = (menu) => {
    const { menutItems } = this.state;
    const menutItemsClone = [...menutItems];

    if (menu.dropdowns) {
      for (let i = 0; i < menutItemsClone.length; i++) {
        if (menutItemsClone[i].value === menu.value) {
          menutItemsClone[i].showDropdown = !menutItemsClone[i].showDropdown;
        } else {
          menutItemsClone[i].showDropdown = false;
        }
      }
      
      this.setState({
        menuItems: menutItemsClone
      });
    } else {
      for (let i = 0; i < menutItemsClone.length; i++) {
        menutItemsClone[i].showDropdown = false;
      }
        
      this.setState({
        currentMenuLink: menu.link,
        menutItems: menutItemsClone
      }, () => {
        this.props.navigate(menu.link);
      });
    }
  }

  goToSubLink = (link) => {
    const { menutItems } = this.state;
    const menutItemsClone = [...menutItems];
    for (let i = 0; i < menutItemsClone.length; i++) {
      menutItemsClone[i].showDropdown = false;
    }
      
    this.setState({
      currentMenuLink: '',
      menutItems: menutItemsClone
    }, () => {
      this.props.navigate(link);
    });
  }

  closeMenuDropdown = () => {
    const { menutItems } = this.state;
    const menutItemsClone = [...menutItems];
    for (let i = 0; i < menutItemsClone.length; i++) {
      menutItemsClone[i].showDropdown = false;
    }
      
    this.setState({
      menutItems: menutItemsClone
    });
  }

  render() {
    const { t } = this.props;
    
    const {
      currentMenuLink,
      menutItems
    } = this.state;

    const {
      onLogout
    } = this.props;

    let menuItems = [];
    let menuList = menutItems;

    for (let i = 0; i < menuList.length; i++) {
      const menu = menuList[i];
      const active = currentMenuLink === menu.link ? 'menu-item-active' : '';

      const {
        dropdowns = []
      } = menu;
      const dropdownItems = dropdowns.map((d, i) => {
        return (
          <div key={i} className="workspace-dropdown-button" onClick={() => this.goToSubLink(d.link)}>
            {t(d.value)}
          </div>
        );
      });


      menuItems.push(
        (
          <div key={menu.link ? menu.link : i} className={`workspace-nav-menu-item ${active}`}>
            <div className="workspace-nav-menu-item-value" onClick={() => this.handleMenuClick(menu)}>
              <FontAwesomeIcon icon={menu.icon} fixedWidth />
              <span className="workspace-nav-menu-text">{t(menu.value)}</span>
            </div>
            { menu.showDropdown && (
              <div className="workspace-nav-menu-item-dropdown">
                {dropdownItems}
              </div>
            )}
          </div>
        )
      );
    }

    return (
      <React.Fragment>
        <div className="workspace-nav">  
          <div className="workspace-name">{t('Poli')}</div>
          <div className="workspace-nav-menu">
            {menuItems}
          </div>
          <div className="workspace-account-menu">
            <div className="workspace-nav-menu-text workspace-account-button" onClick={onLogout}>
              {t('Logout')}
            </div>
          </div>
        </div>
        <div className="workspace-content">
          <Routes>
            <Route exact path="datasource" element={<DataSource />} />
            <Route exact path="report/fullscreen" element={<ReportFullScreenView />} />
            <Route path="report/*" element={<Report {...this.props} />} />
            <Route element={<PageNotFound />} />
          </Routes>
        </div>
      </React.Fragment>
    );
  }
}

export default (withTranslation()(withRouter(Workspace)));

