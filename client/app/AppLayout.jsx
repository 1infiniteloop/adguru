import React, { useEffect } from 'react';
import { Layout, Menu } from 'antd';
const { SubMenu } = Menu;
const { Content } = Layout;
import { SettingOutlined } from '@ant-design/icons';
import NavMenu from './NavMenu'
import AccountsView from './AccountsView'
import AccountView from './AccountView'
import Logo from '../static/adguru_logo_text.png'
import AdminView from './AdminView'
import { viewState, userState, auditsState } from '../state/atoms'
import { useSetRecoilState, useRecoilValue } from 'recoil'
import { size } from 'lodash'

const Routes = () => {
    const view = useRecoilValue(viewState)

    if (view == 'accounts') {
        return <AccountsView />
    }

    if (view == 'account') {
        return <AccountView />
    }

    if (view == 'admin') {
        return <AdminView />
    }
}

const AppLayout = () => {
    const setView = useSetRecoilState(viewState)
    const user = useRecoilValue(userState)
    const audits = useRecoilValue(auditsState)

    useEffect(() => {
        if (!user.admin && size(audits) > 1) {
            window.location = 'https://go.adguru.ai/callekvp5flo'
        }
    }, [audits])

    return (
        <div className="app_container">
            <div className="app_top_header">
                <div className="header_logo">
                    <img onClick={() => setView('accounts')} src={Logo} alt="header logo" />
                </div>

                <div className="header_menu">
                    <Menu mode="horizontal" theme="dark" trigger={["click"]}>

                        <SubMenu icon={<SettingOutlined />} title="Settings" trigger={["click"]}>

                            {user.admin && (
                                <Menu.Item key="admin" onClick={() => setView('admin')}>
                                    Admin
                                </Menu.Item>
                            )}

                            <Menu.Item key="accounts" onClick={() => setView('accounts')}>
                                Accounts
                            </Menu.Item>

                            {/* <Menu.Item key="signout" onClick={props.onSignOut}>Sign Out</Menu.Item>
                            <Menu.Item key="unlink" onClick={props.onUnlinkAccount}>Unlink Account</Menu.Item> */}
                        </SubMenu>
                    </Menu>
                </div>
            </div>
            <Layout className="layout_container">
                <Layout>
                    <Content className="content_wrapper">
                        <div className="site_layout_content">
                            <Routes />
                        </div>
                        {/* <div className={`onboarding_video_container ${}`}>
                            <div className="hide_button" onClick={() => console.log('hide')}>
                                Hide
                            </div>
                            <iframe src="https://www.loom.com/embed/feb2d60ec4b84a668735a9e970ce107a" />
                        </div> */}
                    </Content>
                </Layout>
            </Layout>
        </div>
    )
}

export default AppLayout