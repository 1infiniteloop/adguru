import db from '../firebase'
import { pick, map, reduce, pickBy, get, filter, join, isEmpty, chain, keys as _keys, values, take, compact, chunk, has, includes, sum } from 'lodash'
import { Observable, zip, from, interval, of } from 'rxjs'
import { map as rxmap, mergeMap, filter as rxfilter, scan, share, sample } from 'rxjs/operators';
import axios from 'axios'
import { accounts_url, campaigns_url, campaign_insights_url, adsets_url, adset_insights_url } from './fburls'
import { campaigns_fields, campaign_insight_fields, adset_insights_fields, accounts_fields } from './fbfields'
import { make_time_ranges, percentage_of_total, group_by_metric, project_metric, group_stats, mean_of_metric, show, sort_metric, categorize } from './utility'
let accessToken = "EAAJUaNoZCbbgBAPZCssylaFqGulez28P38drDHD84A9tKRPQqZCiAj6sLmiV8e1QnjdsmeLsI6Pf664MIkNDEgZC0vCwqumTLBf6C1Lvuwd3QVHjP8NdNY4hLNcXTzYld2jJonRQhmGoSZA5gA2TOFYvrcYVPnP4ZD"
let accountId = '658577034981362'
import numeral from 'numeral'
import moment from 'moment'
import shajs from 'sha.js'
// API METHODS

let calc = (expression) => {
    return (isNaN(expression) || !isFinite(expression)) ? 0 : expression
}

const toNum = (val) => val == 'Infinity' || val == null ? 0 : val

export const facebookapi = {
    accounts: {

        audiences: ({ access_token = '', audience_ids = [] }) => {

            return Observable.create(async observer => {

                let audience_fields = [
                    'id',
                    // 'account_id',
                    // 'approximate_count',
                    // 'customer_file_source',
                    // 'data_source',
                    // 'delivery_status',
                    // 'description',
                    // 'external_event_source',
                    // 'is_value_based',
                    // 'lookalike_audience_ids',
                    // 'lookalike_spec',
                    // 'name',
                    // 'operation_status',
                    // 'opt_out_link',
                    // 'permission_for_actions',
                    // 'pixel_id',
                    // 'retention_days',
                    // 'rule',
                    // 'rule_aggregation',
                    // 'sharing_status',
                    'subtype',
                    // 'time_content_updated',
                    // 'time_created',
                    // 'time_updated'
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

                // console.log('audiences')
                // console.log(audience_ids)
                // console.log(audiences)

                try {
                    // let res = await axios(payload)
                    observer.next({ audiences })
                } catch (err) {
                    console.log('audience_error')
                    // show(err.response)
                }
            })
        },

        get: ({ access_token = accessToken, limit = 500 } = {}) => {
            return Observable.create(async observer => {

                let url = accounts_url(limit)

                let request_payload = {
                    method: 'get',
                    url,
                    params: {
                        access_token
                    }
                }

                let accounts = await axios(request_payload)

                let account_ids = chunk(map(accounts.data.data, 'id'), 5)

                let fb_url = 'https://graph.facebook.com/v7.0'
                let fields = join(accounts_fields, ',')

                map(account_ids, async ids => {
                    let batch = JSON.stringify(ids.map(account_id => ({
                        method: 'GET',
                        relative_url: `${account_id}/?limit=1&fields=${fields}`
                    })))

                    request_payload = {
                        method: 'post',
                        url: fb_url,
                        params: {
                            access_token,
                            batch,
                            include_headers: false
                        }
                    }

                    let res = await axios(request_payload)

                    let accts = compact(map(res.data, response => {
                        let account = JSON.parse(response.body)
                        if (!isEmpty(account)) return account
                    }))

                    observer.next(accts)
                })

            })
        },

        campaigns: {
            get: ({ account_id = '', access_token = '', url_fields = [] } = {}) => {

                return Observable.create(async observer => {
                    let url = `https://graph.facebook.com/v7.0/act_${account_id}/campaigns?limit=500`

                    let payload = {
                        method: 'get',
                        url,
                        params: {
                            access_token,
                            fields: join(campaigns_fields(url_fields), ',')
                        }
                    }

                    try {
                        let res = await axios(payload)
                        observer.next(res.data.data)

                        while (res['data']['paging']['next']) {
                            res = await axios({ url: res['data']['paging']['next'] })
                            observer.next(map(res.data.data, 'id'))
                        }
                    } catch (err) {
                        show(err.response.data.error)
                    }
                })
            },


            ids: ({ account_id = '', access_token = '' } = {}) => {
                // console.log('facebbok ids')
                // console.log(account_id, access_token)
                return Observable.create(async observer => {
                    let url = `https://graph.facebook.com/v7.0/act_${account_id}/campaigns?limit=500`

                    let payload = {
                        method: 'get',
                        url,
                        params: {
                            access_token
                        }
                    }

                    try {
                        let res = await axios(payload)
                        observer.next(map(res.data.data, 'id'))

                        while (res['data']['paging']['next']) {
                            res = await axios({ url: res['data']['paging']['next'] })
                            observer.next(map(res.data.data, 'id'))
                        }
                    } catch (err) {
                        show(err.response.data.error)
                    }
                })
            },

            stats: ({ dates = {}, account_id = '', access_token = '' } = {}) => {
                // console.log('stats params')
                // console.log(preset, account_id)
                return facebookapi.accounts.campaigns
                    .ids({ account_id, access_token })
                    .pipe(mergeMap(campaign_id => campaign_id))
                    .pipe(mergeMap(campaign_id => facebookapi.campaign.insights({ campaign_id, access_token, dates })))
                    .pipe(rxfilter(insight => insight !== undefined))
                    .pipe(rxmap(insight => {
                        let account_id = get(insight, `account_id`)
                        let account_name = get(insight, `account_name`)
                        let campaign_name = get(insight, `campaign_name`)
                        let campaign_id = get(insight, `campaign_id`)
                        let stats = { key: campaign_id, account_id, account_name, campaign_name, campaign_id, ...facebookapi.stats(insight) }
                        return stats
                    }))
                    .pipe(scan((acc, insights) => ([...acc, insights]), []))
                    .pipe(
                        rxmap((collection) => percentage_of_total(collection, 'spend')),
                        rxmap((collection) => percentage_of_total(collection, 'made')),
                        rxmap((collection) => percentage_of_total(collection, 'sales')),
                        rxmap((collection) => percentage_of_total(collection, 'views')),
                        rxmap((collection) => percentage_of_total(collection, 'sales_conversion_rate')),
                        rxmap((collection) => project_metric(collection, 'net_roi', 'net_profit_projection')),
                        rxmap((collection) => project_metric(collection, 'roi', 'gross_profit_projection')),
                        rxmap((collection) => categorize(collection)),
                    )
                    .pipe(sample(interval(2000).pipe(rxmap(collection => collection))))
                    .pipe(share())
            }
        },

        adsets: {
            ids: ({ access_token = '', account_id = '' } = {}) => {
                return Observable.create(async observer => {
                    let url = `https://graph.facebook.com/v7.0/act_${account_id}/adsets?limit=500`

                    let payload = {
                        method: 'get',
                        url,
                        params: { access_token }
                    }

                    try {
                        let res = await axios(payload)
                        observer.next(map(res.data.data, 'id'))

                        while (res?.data?.paging?.next) {
                            res = await axios({ url: res.data.paging.next })
                            observer.next(map(res.data.data, 'id'))
                        }
                    } catch (err) {
                        show(err)
                    }
                })
            },

            stats: ({ access_token = '', account_id = '', dates = {} } = {}) => {
                return facebookapi.accounts.adsets
                    .ids({ access_token, account_id })
                    .pipe(mergeMap(adset_id => adset_id))
                    .pipe(mergeMap(adset_id => facebookapi.adsets.insights({ adset_id, access_token, dates })))
                    .pipe(rxfilter(result => !isEmpty(result.account_name)))
                    .pipe(rxfilter(result => result.status == 'ACTIVE'))
                    .pipe(mergeMap(collection => {
                        let { custom_audiences } = collection.targeting
                        let ids = map(custom_audiences, 'id')
                        if (!isEmpty(ids)) {
                            let audiences = from([ids]).pipe(mergeMap(audience_ids => facebookapi.accounts.audiences({ access_token, audience_ids })))
                            return zip(of(collection), audiences)
                                .pipe(
                                    rxmap(res => Object.assign(...res)),
                                    rxmap(res => {
                                        let category
                                        let subtypes = map(res.audiences, 'subtype')
                                        if (includes(subtypes, 'LOOKALIKE')) {
                                            category = 'tof'
                                        } else if (includes(subtypes, 'WEBSITE') || includes(subtypes, 'CUSTOM')) {
                                            category = 'bof'
                                        } else {
                                            category = 'mof'
                                        }
                                        return { ...res, category }
                                    })
                                )
                        } else {
                            let category = 'tof'
                            if (has(collection, 'targeting.product_audience_specs')) {
                                category = 'bof'
                            }
                            return of({ ...collection, category })
                        }
                    }))
                    .pipe(rxmap(insight => {
                        let { category, status } = insight
                        let account_id = get(insight, `account_id`)
                        let account_name = get(insight, `account_name`)
                        let adset_id = get(insight, `adset_id`)
                        let adset_name = get(insight, `adset_name`)
                        let campaign_id = get(insight, `campaign_id`)
                        let campaign_name = get(insight, `campaign_name`)
                        // let status = get(insight, `status`)
                        let stats = { key: adset_id, status, account_name, account_id, adset_id, adset_name, campaign_id, category, campaign_name, ...facebookapi.stats(insight) }
                        return stats
                    }))
                // .pipe(scan((acc, insights) => ([...acc, insights]), []))
                // .pipe(
                //     rxmap((collection) => percentage_of_total(collection, 'spend')),
                //     rxmap((collection) => percentage_of_total(collection, 'made')),
                //     rxmap((collection) => percentage_of_total(collection, 'sales')),
                //     rxmap((collection) => percentage_of_total(collection, 'views')),
                //     rxmap((collection) => percentage_of_total(collection, 'sales_conversion_rate')),
                //     rxmap((collection) => project_metric(collection, 'net_roi', 'net_profit_projection')),
                //     rxmap((collection) => project_metric(collection, 'roi', 'gross_profit_projection')),
                // )
                // .pipe(sample(interval(500).pipe(rxmap(collection => collection))))
                // .pipe(share())
            }
        }
    },

    campaigns: {
        get: ({ account_id = accountId, access_token = accessToken, limit = 500, url_fields = [] } = {}) => {
            return Observable.create(async observer => {

                let url = campaigns_url(`act_${account_id}`, limit)
                let fields = join(campaigns_fields(url_fields), ',')

                let request_payload = {
                    method: 'get',
                    url,
                    params: {
                        access_token,
                        fields,
                    }
                }

                let res = await axios(request_payload)
                observer.next(res.data.data)

                while (res['data']['paging']['next']) {
                    res = await axios({ url: res['data']['paging']['next'] })
                    observer.next(res.data.data)
                }
            })
        },
    },

    campaign: {
        insights: ({ campaign_id = '', dates = {}, access_token = '' } = {}) => {
            return Observable.create(async observer => {
                // let dates = { type: 'aggregate', preset }
                let url = `https://graph.facebook.com/v7.0/${campaign_id}/insights?limit=100`
                let fields = join(campaign_insight_fields, ',')

                let payload = {
                    method: 'get',
                    url,
                    params: {
                        access_token,
                        fields,
                        ...make_time_ranges(dates)
                    }
                }

                try {
                    let res = await axios(payload)
                    map(res.data.data, insight => observer.next(insight))
                } catch (err) {
                    console.log('error')
                }
            })
        },

        adsets: ({ campaign_id = '', dates = {}, access_token = '' } = {}) => {
            return Observable.create(async observer => {
                // dates = { type: 'range', range: { from: '2020-07-01', until: '2020-07-30' } }

                console.log('campaign_id')
                console.log(campaign_id)
                let url = `https://graph.facebook.com/v7.0/${campaign_id}/adsets`


                let adsets_payload = {
                    method: 'get',
                    url,
                    params: {
                        access_token
                    }
                }

                let adsets = await axios(adsets_payload)

                let adset_ids = map(adsets.data.data, 'id')

                let fields = join(adset_insights_fields, ',')

                let adset_insights_url = `https://graph.facebook.com/v7.0/${campaign_id}/insights?limit=100`

                let insights_payload = {
                    method: 'get',
                    url,
                    params: {
                        access_token,
                        fields,
                        ...dates
                    }
                }

                // try {
                //     let res = await axios(payload)
                //     map(res.data.data, insight => observer.next(insight))
                // } catch (err) {
                //     console.log('error')
                // }
            })
        }
    },

    adsets: {
        insights: ({ adset_id = '', access_token = '', dates = {} } = {}) => {
            return Observable.create(async observer => {

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

                    map(insights_res.data.data, insight => {
                        let id = `${insight.adset_id}${since}${until}`
                        console.log('insight')
                        console.log(insight)
                        console.log("adset_res.data")
                        console.log(adset_res.data)
                        // console.log('id')
                        // console.log(id)
                        let payload = {
                            id,
                            ...insight,
                            ...adset_res.data
                        }
                        observer.next({ id })
                    })

                    // observer.next('hi')

                    // let { campaign_name = '' } = insights_res?.data?.data[0]

                    // observer.next(insights_res.data.data[0])

                    // observer.next({
                    //     ...insights_res?.data?.data[0],
                    //     ...adset_res.data
                    // })

                    // map(placement, content => show(content.children[0]))
                    // observer.next(res.data.data[0])
                    // map(res.data.data, insight => observer.next(insight))
                } catch (err) {
                    console.log("adset_insights_error")
                    console.log(err)
                }
            })
        },
    },

    stats: (insight) => {
        // STATS

        // console.log('insight')
        // console.log(insight)

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
        let made = numeral(get(actionValues, 'offsite_conversion.fb_pixel_purchase')).value()
        let spend = numeral(get(picks, 'spend')).value()
        let roi = toNum(numeral(made / spend).value())
        let cost_per_sale = toNum(numeral(spend / sales).value())
        let gross_profit = toNum(numeral(made / sales).value())
        let net_profit = toNum(numeral((made / sales) - cost_per_sale).value())
        let views = numeral(get(picks, 'reach')).value()
        let impressions = numeral(get(picks, 'impressions')).value()
        let frequency = numeral(get(picks, 'frequency')).value()
        let cpv = toNum(numeral(spend / views).value())
        let sales_conversion_rate = toNum(numeral(sales / views * 100).value())
        let clicks = numeral(get(actions, 'link_click')).value()
        let cpc = toNum(numeral(spend / clicks).value())
        let add_to_cart_clicks = numeral(get(actions, 'offsite_conversion.fb_pixel_add_to_cart')).value()
        // how many views equals 1 dollar
        let gross_views_to_dollar_value = toNum(numeral(views / made).value())
        let gross_cost_of_dollar = toNum(numeral(gross_views_to_dollar_value * cpv).value())
        let net_views_to_dollar_value = toNum(numeral((views / (made - spend))).value())
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
        let net_roi = toNum(numeral(profit_per_n_views / cost_per_n_views).value())

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
            net_cost_of_dollar
        }

        return stats
    }
}

const facebookdb = {
    campaigns: {
        get: ({ account_id = accountId }) => {
            return Observable.create(async observer => {
                let response = await db.collection('account').doc(`act_${account_id}`).collection('campaigns').get()

                let campaigns = map(response.docs, doc => doc.data())
                observer.next(campaigns)
            })
        },
    },

    campaign: {
        save: async (insight) => {
            // date format: YYYY-MM-DD
            let date_start = get(insight, 'date_start')
            let date_stop = get(insight, 'date_stop')
            let campaign_id = get(insight, 'campaign_id')
            let hash_val = hash(`${campaign_id}${date_start}${date_stop}`)
            await db.collection('insights').doc(hash_val).set(insight)
                .then(() => console.log(`insight ${hash_val} saved`))
            return insight
        },
    },
}

// OPERATIONS / TRANSFORMATIONS

export const facebook = {
    accounts: {
        get: ({ had_delivery = false, access_token = accessToken }) => {
            if (had_delivery == false) {
                return facebookapi.accounts.get({ access_token })
            }

            if (had_delivery == true) {
                return facebookapi.accounts.get({ access_token })
                    .pipe(scan((acc, curr) => ([...acc, ...curr]), []))
                    .pipe(rxmap(accounts => {
                        return chain(accounts)
                            .filter(account => !isEmpty(account.activities))
                            .filter(account => chain(account.activities.data).map('event_type').includes('delivery'))
                            .value()
                    }))
            }
        }
    },
    campaigns: {

        ['ids']: ({ account_id = accountId, access_token = accessToken, dev = true }) => {
            let source = dev == true
                ? facebookdb.campaigns.get({ account_id })
                : facebookapi.campaigns.get({ account_id, access_token })

            return source.pipe(
                rxmap(campaigns => map(campaigns, 'id')),
                // mergeMap(ids => ids),
            )
        },

        // INSIGHTS COME FROM FB SOURCE

        // refactor the insights function into CAMPAIGNS for fetching the campaigns and the insights functionality separate

        ['insights']: {
            get: ({ preset, account_id = accountId, access_token = accessToken, dev = true }) => {
                if (dev == true) {
                    return Observable.create(async observer => {
                        let response = await db.collection('insights_campaigns').get()
                        let insights = map(response.docs, doc => doc.data())
                        observer.next(insights)
                    })
                }

                if (dev !== true) {
                    let dates = { type: 'aggregate', preset }
                    return facebook.campaigns.ids({ account_id, access_token, dev }).pipe(
                        mergeMap(campaign_ids => chunk(campaign_ids, 5)),
                        mergeMap(campaign_ids => facebookapi.campaign.insights({ campaign_ids, dates, access_token }))
                    )
                }
            },

            all: ({ preset, account_id = accountId, access_token = accessToken, dev = true }) =>
                facebook.campaigns.insights.get({ preset, account_id, access_token, dev })
                    .pipe(scan((acc, insights) => ([...acc, ...insights]), []))
        },

        // STATS ARE FOR UI DISPLAY PURPOSES

        ['stats']: {
            get: ({ preset, account_id = accountId, access_token = accessToken, dev = true }) =>
                facebook.campaigns.insights
                    .all({ preset, account_id, access_token, dev })
                    .pipe(rxmap(insights => map(insights, insight => facebookapi.stats(insight)))),

            unrealized_profits: (collection, group, mean) => from(collection).pipe(
                mergeMap(({ winners, roi }) => {
                    let winner_stats = facebook.campaigns.groups.stats([winners], group, mean)
                    let roi_stats = facebook.campaigns.groups.stats([roi], group, mean)

                    return zip(winner_stats, roi_stats).pipe(
                        rxmap(([winners, { roi }]) => {
                            let projected_profits = roi * winners.spend
                            return projected_profits - winners.made
                        }))
                })
            ),

            projected_profits: (collection, group, mean) => from(collection).pipe(
                mergeMap(({ winners, roi }) => {
                    let winner_stats = facebook.campaigns.groups.stats([winners], group, mean)
                    let roi_stats = facebook.campaigns.groups.stats([roi], group, mean)

                    return zip(winner_stats, roi_stats).pipe(
                        rxmap(([winners, { roi }]) => {
                            return numeral(roi * winners.spend).format('00.[00]')
                        }))
                })
            ),

            efficiency: (collection) => from(collection).pipe(
                rxmap(({ winners, losers }) => {
                    let total = losers.spend + winners.spend
                    return ((winners.spend / total) * 100)
                })
            ),
        },

        ['groups']: {
            stats: (collection = [], group = [], mean = []) => from(collection)
                .pipe(
                    rxmap(collection => ({
                        ...group_stats(collection, group),
                        ...mean_of_metric(collection, mean),
                    }))
                ),

            create: (collection, metric, distribution) => from(collection)
                .pipe(
                    rxmap((collection) => group_by_metric(collection, metric, distribution))
                ),

            winners: (collection) => from(collection)
                .pipe(
                    rxmap(collection => filter(collection, insight => insight.made > 0)),
                    rxmap((collection) => percentage_of_total(collection, 'spend')),
                    rxmap((collection) => percentage_of_total(collection, 'made')),
                    rxmap((collection) => percentage_of_total(collection, 'sales')),
                    rxmap((collection) => percentage_of_total(collection, 'views')),
                    rxmap((collection) => percentage_of_total(collection, 'sales_conversion_rate')),
                    rxmap((collection) => project_metric(collection, 'net_roi', 'net_profit_projection')),
                    rxmap((collection) => project_metric(collection, 'roi', 'gross_profit_projection')),
                ),

            losers: (collection) => from(collection).pipe(
                rxmap(insights => filter(insights, insight => insight.made == 0))
            ),

            roi: (collection) => from(collection).pipe(
                mergeMap(collection => {
                    return Observable.create(observer => {
                        observer.next(sort_metric(filter(collection, insight => Number(insight.roi) > 2.7), 'roi'))
                    })
                })
            )
        }
    },

    campaign: {
        ['insights']: {
            get: ({ campaign_id = '', preset = 'last_30d', access_token = accessToken } = {}) => {
                campaign_id = '23844759810340714'
                let dates = { type: 'aggregate', preset }
                return facebookapi.campaign.insights({ campaign_id, dates, access_token })
            }
        },

        ['stats']: {
            get: (insight) => {
                // STATS
                let id = get(insight, 'campaign_id')
                let name = get(insight, 'campaign_name')
                let start = get(insight, 'date_start')
                let end = get(insight, 'date_stop')

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

                let inline = pickBy(insight, (v, k) => k.includes('inline'))
                let unique = pickBy(insight, (v, k) => k.includes('unique'))
                let outbound = pickBy(insight, (v, k) => k.includes('outbound'))

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

                let sales = numeral(get(actions, 'offsite_conversion.fb_pixel_purchase')).format('00.[00]')
                let made = numeral(get(actionValues, 'offsite_conversion.fb_pixel_purchase')).format('00.[00]')
                let spend = numeral(get(picks, 'spend')).format('00.[00]')
                let roi = (made == 0 || spend == 0) ? 0 : numeral(made / spend).format('00.[00]')
                let cost_per_sale = ((spend / sales) == Infinity) ? 0 : numeral(spend / sales).format('00.[00]')
                let gross_profit = isNaN(made / sales) ? 0 : numeral(made / sales).format('00.[00]')
                let net_profit = isNaN(made / sales) ? 0 : numeral((made / sales) - cost_per_sale).format('00.[00]')
                let views = numeral(get(picks, 'reach')).value()
                let cpv = numeral(spend / views).value()
                let sales_conversion_rate = numeral(sales / views * 100).value()
                let clicks = numeral(get(actions, 'link_click')).value()
                let cpc = numeral(spend / clicks).value()
                let add_to_cart_clicks = numeral(get(actions, 'offsite_conversion.fb_pixel_add_to_cart')).value()
                let gross_views_to_dollar_value = Number((views / Number(made)).toFixed(2))
                let gross_cost_of_dollar = gross_views_to_dollar_value * Number(cpv)
                let net_views_to_dollar_value = Number((views / (Number(made) - Number(spend))).toFixed(2))
                let net_cost_of_dollar = net_views_to_dollar_value * Number(cpv)
                // let landingPageViews = Number(get(actions, 'landing_page_view') ?? 0)
                // let landingPageToSalesConversionRate = (sales / landingPageViews * 100)

                // this metric should be turned into a function that takes in the number of views we could buy
                // since its a relativley easy number to control in facebook we can use it as a control
                // to measure other things as it relates to it. 

                // here we're projecting given a n number of views what should our expected cost be, in this 
                // example the views was already known but it should be made into a function in order
                // to run analysis and do real projections
                let cost_per_n_views = views * (sales_conversion_rate / 100) * Number(cost_per_sale)

                // here we're projecting given a n number of views what should our net profit be accounting for, 
                // after we pay for ads in this example the views was already known but it should be made into a 
                // function in order to run analysis and do real projections
                let profit_per_n_views = views * (sales_conversion_rate / 100) * Number(net_profit)
                // take_home_percentage = profit margin
                let take_home_percentage = (Number(net_profit) / Number(gross_profit) * 100)
                let net_roi = profit_per_n_views / cost_per_n_views

                // PAYLOAD

                let stats = {
                    id,
                    date: { start, end },
                    made,
                    spend,
                    roi,
                    sales,
                    cost_per_sale,
                    // profit_margin,
                    views,
                    cpv,
                    clicks,
                    add_to_cart_clicks,
                    cpc,
                    name,
                    sales_conversion_rate,
                    gross_profit,
                    net_profit,
                    net_roi,
                    take_home_percentage,
                    gross_views_to_dollar_value,
                    gross_cost_of_dollar,
                    net_views_to_dollar_value,
                    net_cost_of_dollar
                }

                return stats
            }
        },

        ['groups']: {
            create: (collection) => from(collection).pipe(
                // rxmap(collection => filter(collection, insight => insight.made > 0)),
                rxmap((collection) => percentage_of_total(collection, 'spend')),
                rxmap((collection) => percentage_of_total(collection, 'made')),
                rxmap((collection) => project_metric(collection)),
            ),
        }
    },

    adsets: {
        get: ({ account_id = '', preset = 'last_30d', access_token = accessToken } = {}) => {
            return Observable.create(async observer => {
                let adsets_url = `https://graph.facebook.com/v7.0/act_${account_id}/adsets?limit=500`

                let request_payload = {
                    method: 'get',
                    url: adsets_url,
                    params: { access_token }
                }

                let adsets = await axios(request_payload)
                let adset_ids = map(adsets.data.data, 'id')
                let dates = { type: 'aggregate', preset }
                map(adset_ids, id => facebookapi.adset
                    .insights({ adset_id: id, access_token, dates })
                    .subscribe(res => observer.next(res)))
            })
        },

        all: ({ campaign_id = '', preset = 'last_30d', access_token = accessToken } = {}) => {
            campaign_id = '23844759810340714'
            let dates = { type: 'aggregate', preset }
            return facebookapi.adsets
                .get({ campaign_id, dates, access_token })
                .pipe(rxmap(adsets => map(adsets, 'id')))
        },
    },

    adset: {
        ['insights']: {
            get: ({ adset_id = '', preset = 'last_30d', access_token = accessToken } = {}) => {
                let dates = { type: 'aggregate', preset }
                return facebookapi.adset.insights({ adset_id, dates, access_token })
            }
        },
    }
}