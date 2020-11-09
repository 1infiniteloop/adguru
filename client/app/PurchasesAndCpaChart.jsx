import React from 'react'
import { dailyAdsetsStatsState } from '../state/selectors'
import { useRecoilValue } from 'recoil';
import { map } from 'lodash'
import Chart from 'react-apexcharts'

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

const PurchasesAndCpaChart = () => {
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
                    title: { text: 'Purchases & CPA' },
                    labels: map(stats, 'date')
                }}
                series={
                    [{
                        name: 'Purchases',
                        type: 'column',
                        data: map(stats, stat => stat.purchases.toLocaleString('en'))
                    }, {
                        name: 'Cost Per Aquisition',
                        type: 'line',
                        data: map(stats, stat => stat.cpa.toLocaleString('en'))
                    }]
                }
                type="line"
                height={350}
            />
        </div>
    )
}

export default PurchasesAndCpaChart;