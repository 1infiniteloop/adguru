import React from 'react'
import { summaryStatsState } from '../state/selectors'
import { useRecoilValue } from 'recoil';
import Chart from 'react-apexcharts'
import { Statistic, PageHeader } from 'antd'
import { calc } from '../../api/utility'

let chart_options = {
    chart: {
        height: 350,
        type: 'line',
        toolbar: { show: false }
    },
    plotOptions: {
        bar: {
            columnWidth: '45%'
        }
    },
    stroke: {
        width: [0, 4],
        curve: 'straight'
    },
    dataLabels: {
        enabled: true,
        enabledOnSeries: [1]
    },
    xaxis: {
        type: 'datetime',
        format: 'YYYY-MM-DD'
    },
    yaxis: [
        {
            title: {},
        },
        {
            opposite: true
        }
    ]
}

let summary = {
    revenue: 0,
    projected: 0
}

const UnrealizedProfitsChart = () => {
    summary = {
        ...summary,
        ...useRecoilValue(summaryStatsState)
    }

    return (
        <div className="chart_container">

            <PageHeader
                className="site_page_header stats_table_header unrealized_profits_header"
                title={
                    <Statistic
                        title="Unrealized Profits"
                        value={calc(summary.projected - summary.revenue).toFixed(0)}
                        prefix="$"
                    />
                }
            />

            <Chart
                className="chart_content"
                options={{
                    ...chart_options,
                    xaxis: {

                        categories: ['Revenue', 'Projected']
                    },
                    yaxis: [
                        {
                            opposite: false
                        }
                    ],
                    title: { text: '' },
                }}
                series={
                    [{
                        data: [
                            Number(summary.revenue).toFixed(0),
                            Number(summary.projected).toFixed(0)
                        ]
                    }]
                }
                type="bar"
                height={350}
            />
        </div>
    )
}

export default UnrealizedProfitsChart;