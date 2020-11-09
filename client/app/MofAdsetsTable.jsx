import React from 'react'
import { mofAdsetsState } from '../state/selectors'
import { useRecoilValue } from 'recoil';
import { Table, PageHeader } from 'antd';
import { currency } from '../../api/utility'
import { toUpper } from 'lodash'

const adset_columns = [
    {
        title: 'Adset Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
    },
    {
        title: 'Spend',
        dataIndex: 'spend',
        key: 'spend',
        render: (value) => currency().format(value),
        sorter: (a, b) => a.spend - b.spend,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Revenue',
        dataIndex: 'made',
        key: 'made',
        render: (value) => currency().format(value),
        sorter: (a, b) => a.made - b.made,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Purchases',
        dataIndex: 'sales',
        key: 'sales',
        render: (value) => value.toLocaleString('en'),
        sorter: (a, b) => a.sales - b.sales,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'ROAS',
        dataIndex: 'roi',
        key: 'roi',
        sorter: (a, b) => a.roi - b.roi,
        sortDirections: ['descend', 'ascend', 'descend'],
        render: (value) => value.toFixed(3),
    },
    // {
    //     title: 'Max ROAS',
    //     dataIndex: 'max_roi',
    //     key: 'max_roi',
    //     // sorter: (a, b) => a.roa - b.roa,
    //     // sortDirections: ['descend', 'ascend', 'descend'],
    //     // render: (value) => value.toFixed(3),
    // },
    {
        title: 'Projection',
        dataIndex: 'projection',
        key: 'projection',
        sorter: (a, b) => a.projection - b.projection,
        sortDirections: ['descend', 'ascend', 'descend'],
        render: (value) => currency(2).format(value),
    },
    // {
    //     title: 'Min CPA',
    //     dataIndex: 'min_cpa',
    //     key: 'min_cpa',
    //     // render: (value) => currency(2).format(value),
    // },
    // {
    //     title: 'Max CPA',
    //     dataIndex: 'max_cpa',
    //     key: 'max_cpa',
    //     // render: (value) => currency(2).format(value),
    // },
    // {
    //     title: 'Net Profit',
    //     dataIndex: 'net_profit',
    //     key: 'net_profit',
    //     // render: (value) => currency().format(value),
    // },
    {
        title: 'Clicks',
        dataIndex: 'clicks',
        key: 'clicks',
        render: (value) => value.toLocaleString('en'),
        sorter: (a, b) => a.clicks - b.clicks,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Views',
        dataIndex: 'views',
        key: 'views',
        render: (value) => value.toLocaleString('en'),
        sorter: (a, b) => a.views - b.views,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Impressions',
        dataIndex: 'impressions',
        key: 'impressions',
        render: (value) => value.toLocaleString('en'),
        sorter: (a, b) => a.impressions - b.impressions,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Frequency',
        dataIndex: 'frequency',
        key: 'frequency',
        render: (value) => value.toFixed(2),
        sorter: (a, b) => a.frequency - b.frequency,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
]

const campaign_columns = [
    {
        title: 'Campaign Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        render: (value) => toUpper(value)
    },
    {
        title: 'Spend',
        dataIndex: 'spend',
        key: 'spend',
        render: (value) => currency().format(value),
        sorter: (a, b) => a.spend - b.spend,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Revenue',
        dataIndex: 'made',
        key: 'made',
        render: (value) => currency().format(value),
        sorter: (a, b) => a.made - b.made,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Purchases',
        dataIndex: 'sales',
        key: 'sales',
        render: (value) => value.toLocaleString('en'),
        sorter: (a, b) => a.sales - b.sales,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Min ROAS',
        dataIndex: 'min_roi',
        key: 'min_roi',
        // sorter: (a, b) => a.roa - b.roa,
        // sortDirections: ['descend', 'ascend', 'descend'],
        render: (value) => value ? value.toLocaleString('en') : 0
    },
    {
        title: 'Max ROAS',
        dataIndex: 'max_roi',
        key: 'max_roi',
        // sorter: (a, b) => a.roa - b.roa,
        // sortDirections: ['descend', 'ascend', 'descend'],
        render: (value) => value ? value.toLocaleString('en') : 0
    },
    {
        title: 'Projection',
        dataIndex: 'projection',
        key: 'projection',
        sorter: (a, b) => a.projection - b.projection,
        sortDirections: ['descend', 'ascend', 'descend'],
        render: (value) => currency(2).format(value),
    },
    {
        title: 'Min CPA',
        dataIndex: 'min_cpa',
        key: 'min_cpa',
        render: (value) => currency(2).format(value),
    },
    {
        title: 'Max CPA',
        dataIndex: 'max_cpa',
        key: 'max_cpa',
        render: (value) => currency(2).format(value),
    },
    {
        title: 'Net Profit',
        dataIndex: 'net_profit',
        key: 'net_profit',
        render: (value) => currency(2).format(value),
    },
    {
        title: 'Clicks',
        dataIndex: 'clicks',
        key: 'clicks',
        render: (value) => value ? value.toLocaleString('en') : 0,
        sorter: (a, b) => a.clicks - b.clicks,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Views',
        dataIndex: 'views',
        key: 'views',
        render: (value) => value ? value.toLocaleString('en') : 0,
        sorter: (a, b) => a.views - b.views,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Impressions',
        dataIndex: 'impressions',
        key: 'impressions',
        render: (value) => value ? value.toLocaleString('en') : 0,
        sorter: (a, b) => a.impressions - b.impressions,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
    {
        title: 'Frequency',
        dataIndex: 'frequency',
        key: 'frequency',
        render: (value) => value ? value.toLocaleString('en') : 0,
        sorter: (a, b) => a.frequency - b.frequency,
        sortDirections: ['descend', 'ascend', 'descend'],
    },
]

let adsets = { stats: [] }

const MofAdsetsTable = () => {

    adsets = {
        ...adsets,
        ...useRecoilValue(mofAdsetsState)
    }

    const campaignExpandedRowRender = (row) => {
        return <Table columns={adset_columns} dataSource={row.children} pagination={false} scroll={{ x: 1800 }} />
    }

    return (
        <div className="chart_container">

            <PageHeader
                className="site_page_header stats_table_header"
                title="Middle Of Funnel Adsets"
            />

            <Table
                rowKey={row => row.key}
                className="funnel_breakdown_table"
                dataSource={adsets.stats}
                columns={campaign_columns}
                size="small"
                pagination={false}
                expandable={{ expandedRowRender: campaignExpandedRowRender }}
                scroll={{ x: 1800 }}
            />
        </div>
    )
}

export default MofAdsetsTable