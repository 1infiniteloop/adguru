import React from 'react'
import { Card } from 'antd';
import NP from 'number-precision'
NP.enableBoundaryChecking(false);

const ChartStats = ({ stats }) => {

    var currency = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    var maybeNaN = (number) => number = number ? number : 0

    if (stats == false) return <div />

    return (
        <Card className="chart_metrics_container">
            <Card.Grid className="gridStyle roa_grid_cell">
                <div className="card_grid_title">ROA</div>
                <div className="card_grid_value">
                    {NP.round(maybeNaN(stats.roi), 2)}
                </div>
            </Card.Grid>
            <Card.Grid className="gridStyle made_grid_cell">
                <div className="card_grid_title">Made</div>
                <div className="card_grid_value">
                    {currency.format(maybeNaN(stats.made))}
                </div>
            </Card.Grid>
            <Card.Grid className="gridStyle sales_grid_cell">
                <div className="card_grid_title">Sales</div>
                <div className="card_grid_value">
                    {stats.sales}
                </div>
            </Card.Grid>
            <Card.Grid className="gridStyle potential_grid_cell">
                <div className="card_grid_title">Potential</div>
                <div className="card_grid_value">
                    {currency.format(NP.round(maybeNaN(stats.projection_of_made_mean), 2))}
                </div>
            </Card.Grid>
            <Card.Grid className="gridStyle spend_grid_cell">
                <div className="card_grid_title">Spend</div>
                <div className="card_grid_value">
                    {currency.format(NP.round(maybeNaN(stats.spend), 2))}
                </div>
            </Card.Grid>
        </Card>
    )
}

export default ChartStats