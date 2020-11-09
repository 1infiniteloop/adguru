import React, { useEffect } from 'react'
import db from '../../firebase'
import { truncate, size } from 'lodash'
import { Table, Space, PageHeader } from 'antd';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { usersState, userState, viewState } from '../state/atoms'

const AdminView = () => {
    const [user, setUser] = useRecoilState(userState)
    const [users, setUsers] = useRecoilState(usersState)
    const setView = useSetRecoilState(viewState)

    useEffect(() => {
        const dbUsers = async () => {
            let items = await db.collection('facebook').get()

            let data = items.docs.map(item => {
                let user = item.data()

                let { profile } = user
                let { email, first_name, id, last_name, name } = profile
                let userPayload = { email, first_name, id, last_name, name }

                let payload = {
                    id: user?.profile?.id,
                    email: user?.profile?.email,
                    first_name: user?.profile?.first_name,
                    last_name: user?.profile?.last_name,
                    accessToken: user?.accessToken,
                    key: user?.accessToken,
                    uid: user?.profile.id
                }

                return payload
            })

            setUsers(data)
        }

        dbUsers()

    }, [])

    const onViewUserAccount = (event) => {
        let accessToken = event.target.getAttribute('value')
        setUser({ accessToken, admin: true, uid: user.uid })
        setView('accounts')
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'First Name',
            dataIndex: 'first_name',
            key: 'first_name',
        },
        {
            title: 'Last Name',
            dataIndex: 'last_name',
            key: 'last_name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Token',
            dataIndex: 'accessToken',
            key: 'token',
            render: (text, record) => truncate(record.accessToken, { length: 20 })
        },
        {
            title: 'Action',
            dataIndex: 'accessToken',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <a onClick={onViewUserAccount} value={record.accessToken}>View</a>
                </Space>
            ),
        },
    ]

    return (
        <div className="admin_view_container">
            <PageHeader
                className="users_page_header site_page_header"
                title="Users"
                subTitle={size(users)}
            />

            <Table
                columns={columns}
                dataSource={users}
                size="small"
                pagination={{ pageSize: 50 }}
            />
        </div>
    )
}

export default AdminView;