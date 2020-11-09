import React from 'react'
import { Menu, notification, Layout } from 'antd';
const { Sider } = Layout;
const { SubMenu } = Menu;
import { map } from 'lodash'
import { CloseCircleTwoTone } from '@ant-design/icons';

const NavMenu = ({ audits, isAdmin, onSelectAudit, onDeleteAudit }) => {

    const info = () => {
        notification['warning']({
            message: 'Coming soon',
            description: `This feature isn't quite ready yet`
        })
    }

    return (
        <Sider className="menu_side_bar">
            <Menu
                mode="inline"
                defaultSelectedKeys={['accounts']}
                defaultOpenKeys={['audits']}
                style={{ height: '100%', borderRight: 0 }}
            >
                {isAdmin && (
                    <Menu.Item key="adming">
                        <Link to="/admin/1">
                            Admin
                        </Link>
                    </Menu.Item>
                )}

                <Menu.Item key="accounts">
                    <Link to="/app/accounts">
                        Accounts
                    </Link>
                </Menu.Item>

                <SubMenu key="audits" title={'Audits'}>
                    {map(audits, audit => {
                        return (
                            <Menu.Item key={audit.account_id}>
                                <div className="delete_audit_button" onClick={() => onDeleteAudit(audit.account_id)}>
                                    <CloseCircleTwoTone twoToneColor="#eb2f96" />
                                </div>
                                <Link
                                    to={`/app/accounts/${audit.account_id}`}
                                    onClick={onSelectAudit}
                                    value={audit.account_id}
                                >
                                    {audit.name}
                                </Link>
                            </Menu.Item>
                        )
                    })}
                </SubMenu>

            </Menu>
        </Sider>
    )
}

export default NavMenu;