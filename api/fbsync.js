const axios = require('axios')
const { show, calc } = require('./utility')
const { map, uniq, join, includes, has, isEmpty, get, chain, reduce, pick } = require('lodash')
const { adset_insights_fields } = require('./fbfields')
const shajs = require('sha.js')
const numeral = require('numeral')

export const run_report = async (access_token, account_id, running) => {
    let ids = await adset_ids(access_token, account_id)

    if (!isEmpty(ids)) {
        let insights = await Promise.all(ids.map(async id => {
            let insight = await adset_insights(id, access_token, running)
            return insight[0]
        }))

        insights = insights.filter(insight => !isEmpty(insight))

        let cats = await Promise.all(insights.map(async adset => {
            let { custom_audiences } = adset.targeting
            let ids = map(custom_audiences, 'id')
            let payload
            if (!isEmpty(ids)) {
                let category
                let res = await audiences(access_token, ids)
                let subtypes = map(res.audiences, 'subtype')
                if (includes(subtypes, 'LOOKALIKE')) {
                    category = 'tof'
                } else if (includes(subtypes, 'WEBSITE') || includes(subtypes, 'CUSTOM')) {
                    category = 'bof'
                } else {
                    category = 'mof'
                }
                payload = { ...adset, category }
            } else {
                let category = 'tof'
                if (has(adset, 'targeting.product_audience_specs')) {
                    category = 'bof'
                }
                payload = { ...adset, category }
            }
            return payload
        }))

        let adsets = map(cats, insight => {
            let { category, status } = insight
            let account_id = get(insight, `account_id`)
            let account_name = get(insight, `account_name`)
            let adset_id = get(insight, `adset_id`)
            let adset_name = get(insight, `adset_name`)
            let campaign_id = get(insight, `campaign_id`)
            let campaign_name = get(insight, `campaign_name`)
            let id = shajs('sha256').update(`${running.id}${insight.adset_id}`).digest('hex')
            let stats = {
                id,
                key: id,
                status,
                account_name,
                account_id,
                adset_id,
                adset_name,
                campaign_id,
                category,
                campaign_name,
                ...insight_stats(insight)
            }
            return stats
        })

        return adsets
    } else {
        return []
    }

}

export const adset_ids = async (access_token, account_id) => {
    let ids = []
    let url = `https://graph.facebook.com/v7.0/act_${account_id}/adsets?limit=500`

    let payload = {
        method: 'get',
        url,
        params: { access_token }
    }

    try {
        let res = await axios(payload)
        ids = map(res.data.data, 'id')

        while (res?.data?.paging?.next) {
            res = await axios({ url: res.data.paging.next })
            ids = [...ids, ...map(res.data.data, 'id')]
        }
        return uniq(ids)
    } catch (err) {
        console.log("adset_ids_error")
        console.log(err)
    }
}

export const adset_insights = async (adset_id, access_token, dates) => {

    let { since, until } = dates
    let insights_url = `https://graph.facebook.com/v7.0/${adset_id}/insights`
    let adset_url = `https://graph.facebook.com/v7.0/${adset_id}`
    let fields = join(adset_insights_fields, ',')

    let insights_payload = {
        method: 'get',
        url: insights_url,
        params: {
            access_token,
            fields,
            time_ranges: [{ since, until }]
        }
    }

    let adset_payload = {
        method: 'get',
        url: adset_url,
        params: {
            access_token,
            fields: 'targeting,status',
            time_ranges: [{ since, until }]
        }
    }

    try {
        let insights_res = await axios(insights_payload)
        let adset_res = await axios(adset_payload)

        console.log('insights_res')
        console.log(insights_res.data.data)

        return map(insights_res.data.data, insight => {
            let id = `${insight.adset_id}${since}${until}`
            return {
                id,
                ...insight,
                ...adset_res.data
            }
        })

    } catch (err) {
        console.log("adset_insights_error")
        console.log(err)
    }

}

export const audiences = async (access_token, audience_ids) => {
    let audience_fields = [
        'id',
        'subtype'
    ]

    let fields = join(audience_fields, ',')

    let audiences = await Promise.all(audience_ids.map(async audience_id => {
        let url = `https://graph.facebook.com/v8.0/${audience_id}`
        let payload = {
            method: 'get',
            url,
            params: {
                access_token,
                fields
            }
        }

        try {
            let res = await axios(payload)
            return res.data
        } catch (err) {
            console.log('audience_error_top')
            console.log(err.response.data)
            return
        }

    }))

    try {
        return { audiences }
    } catch (err) {
        console.log('audience_error')
        show(err)
    }
}

export const adset_category = async (access_token, adset) => {
    let { custom_audiences } = adset.targeting
    let ids = map(custom_audiences, 'id')
    let payload
    if (!isEmpty(ids)) {
        let category
        let res = await audiences(access_token, ids)
        let subtypes = map(res.audiences, 'subtype')
        if (includes(subtypes, 'LOOKALIKE')) {
            category = 'tof'
        } else if (includes(subtypes, 'WEBSITE') || includes(subtypes, 'CUSTOM')) {
            category = 'bof'
        } else {
            category = 'mof'
        }
        payload = { ...adset, category }
    } else {
        let category = 'tof'
        if (has(adset, 'targeting.product_audience_specs')) {
            category = 'bof'
        }
        payload = { ...adset, category }
    }
    return payload
}

export const insight_stats = (insight) => {
    // STATS

    console.log('insight')
    console.log(insight)

    let start = get(insight, 'date_start')
    let end = get(insight, 'date_stop')

    let date_id = (date) => chain(date).split('-').join('').toNumber().value()

    let start_date_id = date_id(start)
    let end_date_id = date_id(end)

    let date_sha = shajs('sha256').update(`${start_date_id}${end_date_id}`).digest('hex')

    let actionValues = insight.action_values
    let actionValuesReducer = (acc, { action_type, value }) => ({ ...acc, [action_type]: value })
    actionValues = reduce(actionValues, actionValuesReducer, {})

    let actions = insight.actions
    let actionsReducer = (acc, { action_type, value }) => ({ ...acc, [action_type]: value })
    actions = reduce(actions, actionsReducer, {})

    let costsPerAction = insight.cost_per_action_type
    let costsPerActionReducer = (acc, { action_type, value }) => ({ ...acc, [action_type]: value })
    costsPerAction = reduce(costsPerAction, costsPerActionReducer, {})

    let costsPerUniqueAction = insight.cost_per_unique_action_type
    let costsPerUniqueActionReducer = (acc, { action_type, value }) => ({ ...acc, [action_type]: value })
    costsPerAction = reduce(costsPerUniqueAction, costsPerUniqueActionReducer, {})

    let uniqueActions = insight.unique_actions
    let uniqueActionsReducer = (acc, { action_type, value }) => ({ ...acc, [action_type]: value })
    uniqueActions = reduce(uniqueActions, uniqueActionsReducer, {})

    // let inline = pickBy(insight, (v, k) => k.includes('inline'))
    // let unique = pickBy(insight, (v, k) => k.includes('unique'))
    // let outbound = pickBy(insight, (v, k) => k.includes('outbound'))

    let picks = pick(insight, [
        'buying_type',
        'cpm',
        'frequency',
        'impressions',
        'objective',
        'reach',
        'spend',
        'campaign_id',
        'purchase_roas'
    ])

    let sales = numeral(get(actions, 'offsite_conversion.fb_pixel_purchase')).value()
    let leads = numeral(get(actions, "offsite_conversion.fb_pixel_lead")).value()
    let made = numeral(get(actionValues, 'offsite_conversion.fb_pixel_purchase')).value()
    let spend = numeral(get(picks, 'spend')).value()
    let cpl = calc(numeral(spend / leads).value())
    let roi = calc(numeral(made / spend).value())
    let cost_per_sale = calc(numeral(spend / sales).value())
    let gross_profit = calc(numeral(made / sales).value())
    let net_profit = calc(calc((made / sales) - cost_per_sale))
    let views = numeral(get(picks, 'reach')).value()
    let impressions = numeral(get(picks, 'impressions')).value()
    let frequency = numeral(get(picks, 'frequency')).value()
    let cpv = calc(numeral(spend / views).value())
    let sales_conversion_rate = calc(numeral(sales / views * 100).value())
    let clicks = numeral(get(actions, 'link_click')).value()
    let cpc = calc(numeral(spend / clicks).value())
    let add_to_cart_clicks = numeral(get(actions, 'offsite_conversion.fb_pixel_add_to_cart')).value()
    // how many views equals 1 dollar
    let gross_views_to_dollar_value = calc(numeral(views / made).value())
    let gross_cost_of_dollar = calc(numeral(gross_views_to_dollar_value * cpv).value())
    let net_views_to_dollar_value = calc(numeral((views / (made - spend))).value())
    let net_cost_of_dollar = numeral(net_views_to_dollar_value * cpv).value()
    // let landingPageViews = Number(get(actions, 'landing_page_view') ?? 0)
    // let landingPageToSalesConversionRate = (sales / landingPageViews * 100)

    // this metric should be turned into a function that takes in the number of views we could buy
    // since its a relativley easy number to control in facebook we can use it as a control
    // to measure other things as it relates to it. 

    // here we're projecting given a n number of views what should our expected cost be, in this 
    // example the views was already known but it should be made into a function in order
    // to run analysis and do real projections
    let cost_per_n_views = numeral(views * (sales_conversion_rate / 100) * cost_per_sale).value()

    // here we're projecting given a n number of views what should our net profit be accounting for, 
    // after we pay for ads in this example the views was already known but it should be made into a 
    // function in order to run analysis and do real projections
    let profit_per_n_views = numeral(views * (sales_conversion_rate / 100) * net_profit).value()
    // take_home_percentage = profit margin
    let take_home_percentage = calc(net_profit / gross_profit * 100)
    let net_roi = calc(profit_per_n_views / cost_per_n_views)

    // PAYLOAD

    let stats = {
        // id,
        date_sha,
        start_date: start,
        end_date: end,
        start_date_id,
        end_date_id,
        date: { start, end },
        made,
        spend,
        roi,
        sales,
        cost_per_sale,
        // profit_margin,
        views,
        impressions,
        frequency,
        cpv,
        clicks,
        add_to_cart_clicks,
        cpc,
        // name,
        sales_conversion_rate,
        gross_profit,
        net_profit,
        net_roi,
        take_home_percentage,
        gross_views_to_dollar_value,
        gross_cost_of_dollar,
        net_views_to_dollar_value,
        net_cost_of_dollar,
        cpl,
        leads
    }

    return stats
}