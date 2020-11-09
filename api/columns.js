import React from 'react'
import { Tooltip } from 'antd';
import { capitalize, truncate, } from 'lodash'
import numeral from 'numeral'

var currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const columns = (view, setDrawer) => [
    {
        title: `${capitalize(view)} Name`,
        dataIndex: `name`,
        key: `name`,
        render: (value, record) => (
            <Tooltip placement="right" title={value}>
                <a onClick={() => setDrawer({ visible: true, type: view, id: record[`${view}_id`] })}>
                    {truncate(value, { length: 30 })}
                </a>
            </Tooltip>
        ),
    },
    {
        title: 'ID',
        dataIndex: `${view}_id`,
        key: `id`,
        render: value => value,
    },
    {
        title: 'Category',
        key: 'category',
        dataIndex: 'category',
        // render: value => numeral(value).format('0,0'),
        sorter: (a, b) => a.category.localeCompare(b.category),
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Spend',
        dataIndex: 'spend',
        key: 'spend',
        render: value => currency.format(value.toFixed(2)),
        sorter: (a, b) => a.spend - b.spend,
        sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
        title: 'Made',
        dataIndex: 'made',
        key: 'made',
        render: value => currency.format(value.toFixed(2)),
        sorter: (a, b) => a.made - b.made,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Sales',
        key: 'sales',
        dataIndex: 'sales',
        render: value => numeral(value).format('0,0'),
        sorter: (a, b) => a.sales - b.sales,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Min ROAS',
        dataIndex: 'min_roi',
        key: 'min_roi',
        render: value => value.toFixed(4) ?? 0,
        sorter: (a, b) => a.roi - b.roi,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Max ROAS',
        dataIndex: 'max_roi',
        key: 'max_roi',
        render: value => value.toFixed(4),
        sorter: (a, b) => a.roi - b.roi,
        sortDirections: ['descend', 'ascend', 'descend']
    },

    {
        title: 'ROAS',
        dataIndex: 'roi',
        key: 'roi',
        render: value => value.toFixed(4),
        sorter: (a, b) => a.roi - b.roi,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Net ROAS',
        dataIndex: 'net_roi',
        key: 'net_roi',
        render: value => numeral(value).format('0,0.0000'),
        sorter: (a, b) => a.net_roi - b.net_roi,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Projection',
        dataIndex: 'projection',
        key: 'projection',
        render: value => currency.format(value.toFixed(0)),
        sorter: (a, b) => a.projection - b.projection,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: <Tooltip title="Cost Per Sale">Min CPA</Tooltip>,
        key: 'min_cpa',
        dataIndex: 'min_cpa',
        render: value => currency.format(value.toFixed(2)),
        sorter: (a, b) => a.cost_per_sale - b.cost_per_sale,
        sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
        title: <Tooltip title="Cost Per Sale">Max CPA</Tooltip>,
        key: 'max_cpa',
        dataIndex: 'max_cpa',
        render: value => currency.format(value.toFixed(2)),
        sorter: (a, b) => a.cost_per_sale - b.cost_per_sale,
        sortDirections: ['ascend', 'descend', 'ascend']
    },

    {
        title: <Tooltip title="Cost Per Sale">CPA</Tooltip>,
        key: 'cpa',
        dataIndex: 'cpa',
        render: value => currency.format(value.toFixed(2)),
        sorter: (a, b) => a.cost_per_sale - b.cost_per_sale,
        sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
        title: 'Gross Margin',
        dataIndex: 'gross_profit',
        key: 'gross_profit',
        render: value => currency.format(numeral(value).format('00[00]')),
        sorter: (a, b) => a.gross_profit - b.gross_profit,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Profit Margin',
        dataIndex: 'net_profit',
        key: 'net_profit',
        render: value => currency.format(value.toFixed(2)),
        sorter: (a, b) => a.net_profit - b.net_profit,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Clicks',
        dataIndex: 'clicks',
        key: 'clicks',
        render: value => numeral(value).format('0,0'),
        sorter: (a, b) => a.clicks - b.clicks,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Views',
        dataIndex: 'views',
        key: 'views',
        render: value => numeral(value).format('0,0'),
        sorter: (a, b) => a.views - b.views,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Impressions',
        dataIndex: 'impressions',
        key: 'impressions',
        render: value => numeral(value).format('0,0'),
        sorter: (a, b) => a.impressions - b.impressions,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Frequency',
        dataIndex: 'frequency',
        key: 'frequency',
        render: value => numeral(value).format('0,0.0000'),
        sorter: (a, b) => a.frequency - b.frequency,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: <Tooltip title="Cost Per View">CPV</Tooltip>,
        dataIndex: 'cpv',
        key: 'cpv',
        render: value => currency.format(numeral(value).format('0,0.000000')),
        sorter: (a, b) => a.cpv - b.cpv,
        sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
        title: <Tooltip title="Cost Per Clicks">CPC</Tooltip>,
        dataIndex: 'cpc',
        key: 'cpc',
        render: value => currency.format(numeral(value).format('0,0.000000')),
        sorter: (a, b) => a.cpc - b.cpc,
        sortDirections: ['ascend', 'descend', 'ascend']
    },
    {
        title: 'Cart Clicks',
        dataIndex: 'add_to_cart_clicks',
        key: 'add_to_cart_clicks',
        render: value => numeral(value).format('0,0'),
        sorter: (a, b) => a.add_to_cart_clicks - b.add_to_cart_clicks,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Gross Views/$',
        dataIndex: 'gross_views_to_dollar_value',
        key: 'gross_views_to_dollar_value',
        render: value => numeral(value).format('0,0'),
        sorter: (a, b) => a.gross_views_to_dollar_value - b.gross_views_to_dollar_value,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Net Views/$',
        dataIndex: 'net_views_to_dollar_value',
        key: 'net_views_to_dollar_value',
        render: value => numeral(value).format('0,0'),
        sorter: (a, b) => a.net_views_to_dollar_value - b.net_views_to_dollar_value,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: 'Gross Cost of $',
        dataIndex: 'gross_cost_of_dollar',
        key: 'gross_cost_of_dollar',
        render: value => currency.format(numeral(value).format('0,0.0000')),
        sorter: (a, b) => a.gross_cost_of_dollar - b.gross_cost_of_dollar,
        sortDirections: ['ascend', 'descend', 'descend']
    },
    {
        title: 'Net Cost of $',
        dataIndex: 'net_cost_of_dollar',
        key: 'net_cost_of_dollar',
        render: value => currency.format(numeral(value).format('0,0.0000')),
        sorter: (a, b) => a.net_cost_of_dollar - b.net_cost_of_dollar,
        sortDirections: ['ascend', 'descend', 'descend']
    },
    {
        title: 'Take home %',
        dataIndex: 'take_home_percentage',
        key: 'take_home_percentage',
        render: value => numeral(value).format('0,0.0000'),
        sorter: (a, b) => a.take_home_percentage - b.take_home_percentage,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: '% of spend',
        dataIndex: 'spend_as_a_percentage_of_total',
        key: 'spend_as_a_percentage_of_total',
        render: value => numeral(value).format('0,0.0000'),
        sorter: (a, b) => a.spend_as_a_percentage_of_total - b.spend_as_a_percentage_of_total,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: '% of made',
        dataIndex: 'made_as_a_percentage_of_total',
        key: 'made_as_a_percentage_of_total',
        render: value => numeral(value).format('0,0.0000'),
        sorter: (a, b) => a.made_as_a_percentage_of_total - b.made_as_a_percentage_of_total,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: '% of sales',
        dataIndex: 'sales_as_a_percentage_of_total',
        key: 'sales_as_a_percentage_of_total',
        render: value => numeral(value).format('0,0.0000'),
        sorter: (a, b) => a.sales_as_a_percentage_of_total - b.sales_as_a_percentage_of_total,
        sortDirections: ['descend', 'ascend', 'descend']
    },
    {
        title: '% of views',
        dataIndex: 'views_as_a_percentage_of_total',
        key: 'views_as_a_percentage_of_total',
        render: value => numeral(value).format('0,0.0000'),
        sorter: (a, b) => a.views_as_a_percentage_of_total - b.views_as_a_percentage_of_total,
        sortDirections: ['descend', 'ascend', 'descend']
    },
];