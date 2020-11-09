import React from 'react'
import { Spin, Space } from 'antd';

const Spinner = () => {
    return (
        <div className='spin_container'>
            <Space size="middle">
                <Spin size="large" />
            </Space>
        </div>
    )
}

export default Spinner;