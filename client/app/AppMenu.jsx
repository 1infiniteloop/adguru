import React from 'react'
import { Menu } from 'antd';
import { AppstoreOutlined, FolderOutlined, UnorderedListOutlined, DashboardOutlined } from '@ant-design/icons';

const AppMenu = ({ setView, view }) => {
    let is_mobile = window.innerWidth > 400 ? false : true

    const onViewChange = (e) => setView(e.key)
    return (
        <div className="app_menu_container">
            {is_mobile && (
                <Menu onClick={onViewChange} selectedKeys={[view]} mode="horizontal">
                    <Menu.Item key="account" className="hidden">
                        Account
                    </Menu.Item>
                    <Menu.Item key="campaigns">
                        Campaigns
                    </Menu.Item>
                    <Menu.Item key="adsets">
                        Adsets
                    </Menu.Item>
                    <Menu.Item key="ads" className="hidden">
                        Ads
                    </Menu.Item>
                </Menu>
            )}

            {!is_mobile && (
                <Menu onClick={onViewChange} selectedKeys={[view]} mode="horizontal">
                    <Menu.Item key="account" icon={<DashboardOutlined />} className="hidden">
                        Account
                    </Menu.Item>
                    <Menu.Item key="campaigns" icon={<AppstoreOutlined />}>
                        Campaigns
                    </Menu.Item>
                    <Menu.Item key="adsets" icon={<FolderOutlined />}>
                        Adsets
                    </Menu.Item>
                    <Menu.Item key="ads" icon={<UnorderedListOutlined />} className="hidden">
                        Ads
                    </Menu.Item>
                </Menu>
            )}
        </div>
    )
}

export default AppMenu;