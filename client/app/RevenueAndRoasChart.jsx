import React from 'react'
import Chart from 'react-apexcharts'
import { dailyAdsetsStatsState } from '../state/selectors'
import { useRecoilValue } from 'recoil';
import { map } from 'lodash'

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

let stats = []

const RevenueAndRoasChart = () => {

    stats = {
        ...stats,
        ...useRecoilValue(dailyAdsetsStatsState)
    }

    return (
        <div className="chart_container">
            <Chart
                className="chart_content"
                options={{
                    ...chart_options,
                    title: { text: 'Revenue & ROAS' },
                    labels: map(stats, 'date')
                }}
                series={
                    [{
                        name: 'Revenue',
                        type: 'column',
                        data: map(stats, stat => stat.revenue.toLocaleString('en'))
                    }, {
                        name: 'Return On Adspend',
                        type: 'line',
                        data: map(stats, stat => stat.roa.toLocaleString('en'))
                    }]
                }
                type="line"
                height={350}
            />
        </div>
    )
}

export default RevenueAndRoasChart;