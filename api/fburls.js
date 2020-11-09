export let accounts_url = (limit = 500) => `https://graph.facebook.com/v7.0/me/adaccounts?limit=${limit}`
export let campaigns_url = (act_id, limit = 500) => `https://graph.facebook.com/v7.0/${act_id}/campaigns?limit=${limit}`
export let campaign_insights_url = (campaign_id, limit = 500) => `https://graph.facebook.com/v7.0/${campaign_id}/insights?limit=${limit}`
export let adset_url = (adset_id) => `https://graph.facebook.com/v7.0/${adset_id}`
export let adset_insights_url = (adset_id, limit = 500) => `https://graph.facebook.com/v7.0/${adset_id}/insights?limit=${limit}`
export let ads_url = (act_id, limit = 500) => `https://graph.facebook.com/v7.0/act_${act_id}/ads?limit=${limit}`
export let ad_insights_url = (ad_id) => `https://graph.facebook.com/v7.0/${ad_id}/insights`