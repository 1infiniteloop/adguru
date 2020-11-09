import React, { useEffect } from 'react'
import { userState, accountState, localFinishedReportsState } from '../state/atoms'
import { dailyAdsetsStatsState, reportsState, DailyStats, topAdsetsState, stats } from '../state/selectors'
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Table, PageHeader } from 'antd';
import { chain, values, size, chunk, map } from 'lodash'
import { currency } from '../../api/utility'
import axios from 'axios'
import { run_report } from '../../api/fbsync'


const adset_columns = [
    {
        title: 'Campaign Name',
        dataIndex: 'campaign_name',
        key: 'campaign_name',
    },
    {
        title: 'Campaign ID',
        dataIndex: 'campaign_id',
        key: 'campaign_id',
    },
    {
        title: 'Adset Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Adset ID',
        dataIndex: 'adset_id',
        key: 'adset_id',
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

const DailyAdsetsStatsTable = () => {
    const user = useRecoilValue(userState)
    const { accessToken } = user
    const account = useRecoilValue(accountState)
    const { account_id } = account
    const dailyStats = useRecoilValue(dailyAdsetsStatsState)
    const setFinishedReports = useSetRecoilState(localFinishedReportsState)
    const reports = useRecoilValue(reportsState)
    const daily = useRecoilValue(DailyStats)
    const topAdsets = useRecoilValue(topAdsetsState)

    // console.log("dailyStats")
    // console.log(dailyStats)
    // console.log('daily')
    // console.log(daily)

    const daily_columns = [
        {
            title: 'Time Range',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Spend',
            dataIndex: 'spend',
            key: 'spend',
            render: (value) => currency().format(value),
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => currency().format(value),
            sorter: (a, b) => a.revenue - b.revenue,
            sortDirections: ['descend', 'ascend', 'descend']
        },
        {
            title: 'Purchases',
            dataIndex: 'purchases',
            key: 'purchases',
            // render: (value) => value.toLocaleString('en'),
        },
        {
            title: 'ROAS',
            dataIndex: 'roa',
            key: 'roa',
            sorter: (a, b) => a.roa - b.roa,
            sortDirections: ['descend', 'ascend', 'descend'],
            render: (value) => value.toLocaleString('en'),
        },
        {
            title: 'CPA',
            dataIndex: 'cpa',
            key: 'cpa',
            render: (value) => currency().format(value),
        },
        {
            title: 'TOF',
            dataIndex: 'tof',
            key: 'tof',
            render: (value, record) => `${chain(record.funnel).filter(cats => cats.category == 'tof').head().get('spend_percentage').value()}%`
        },
        {
            title: 'MOF',
            dataIndex: 'mof',
            key: 'mof',
            render: (value, record) => `${chain(record.funnel).filter(cats => cats.category == 'mof').head().get('spend_percentage').value()}%`
        },
        {
            title: 'BOF',
            dataIndex: 'bof',
            key: 'bof',
            render: (value, record) => `${chain(record.funnel).filter(cats => cats.category == 'bof').head().get('spend_percentage').value()}%`
        },
        {
            title: 'Update',
            dataIndex: '',
            key: 'update',
            render: (value, record) => {
                return <button onClick={() => runReport(record.date)}>Update</button>
            },
        },
    ]

    // useEffect(() => {
    //     let adset_url = `http://localhost:3000/adset`
    //     let adsets_ref = `facebook/accounts/${account_id}/adsets`
    //     axios.post(
    //         adset_url,
    //         { ref: adsets_ref, data: ['hellogoodbye'] },
    //         { headers: { 'Content-Type': 'application/json' } }
    //     )
    // }, [])

    const runReport = (date) => {
        console.log('adsetStats')
        console.log(reports)
        // date = '2020-10-04'
        // console.log(date)

        let running = reports.filter(report => report.until == date)[0]
        const adsetStats = () => run_report(accessToken, account_id, running)

        let report = adsetStats()

        report.then(adsets => {
            console.log('settingAdsets')
            console.log(adsets)
            console.log(size(adsets))
            console.log(stats(adsets))
            setFinishedReports(prev => [...prev, running])
            let chunks = chunk(adsets, 50)

            // let adset_url = `http://localhost:3000/adset`
            let adset_url = `https://us-central1-adguru-67745.cloudfunctions.net/adguru/adset`
            let adsets_ref = `facebook/accounts/${account_id}/adsets`
            map(chunks, chunk => axios.post(adset_url, { ref: adsets_ref, data: chunk }))
            console.log('saving adsets')

            console.log('saving report date')
            // let report_url = `http://localhost:3000/report`
            let report_url = `https://us-central1-adguru-67745.cloudfunctions.net/adguru/report`
            let dates_ref = `facebook/accounts/${account_id}/dates/adsets`
            axios.post(report_url, { ref: dates_ref, data: { ...running, size: size(adsets) } })
        })
    }

    const dailyExpandedRowRender = (row) => {
        return <Table
            columns={adset_columns}
            dataSource={row.best_in_group_adsets}
            pagination={false}
            scroll={{ x: 1800 }}
        />
    }

    return (
        <div className="chart_container">

            <PageHeader
                className="site_page_header stats_table_header"
                title="Recommendations"
            />

            <Table
                rowKey={row => row.key}
                className="funnel_breakdown_table"
                dataSource={dailyStats}
                columns={daily_columns}
                size="small"
                pagination={false}
                expandable={{ expandedRowRender: dailyExpandedRowRender }}
                scroll={{ x: 1100 }}
            />
        </div>
    )
}

export default DailyAdsetsStatsTable;