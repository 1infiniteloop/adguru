import React from 'react'
import { Card } from 'antd';
import NP from 'number-precision'
import { map } from 'lodash'
NP.enableBoundaryChecking(false);

const ChartStats = ({ stats }) => {

    console.log("stats")
    console.log(stats.days)

    var currency = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    var maybeNaN = (number) => number = number ? number : 0

    return (
        <div className="top_charts_container">
            <Card title="SALES">
                <div className="top_charts_container_row_container">
                    <div>Today</div>
                    <div>{maybeNaN(stats.days[1]?.sales)}</div>
                </div>
                <div className="top_charts_container_row_container">
                    <div>Last 3</div>
                    <div>{maybeNaN(stats.days[3]?.sales)}</div>
                </div>
                <div className="top_charts_container_row_container">
                    <div>Last 7</div>
                    <div>{maybeNaN(stats.days[7]?.sales)}</div>
                </div>
                <div className="top_charts_container_row_container">
                    <div>Last 30</div>
                    <div>{maybeNaN(stats.days[30]?.sales)}</div>
                </div>
            </Card>
            <Card title="ROA">
                <p>{NP.round(maybeNaN(stats.roi), 2)}</p>
                <p>Card content</p>
                <p>Card content</p>
            </Card>
            <Card title="MADE">
                <p>{currency.format(maybeNaN(stats.made))}</p>
                <p>Card content</p>
                <p>Card content</p>
            </Card>
            <Card title="SPEND">
                <p>{currency.format(maybeNaN(stats.spend))}</p>
                <p>Card content</p>
                <p>Card content</p>
            </Card>
        </div>
    )
}

export default ChartStats