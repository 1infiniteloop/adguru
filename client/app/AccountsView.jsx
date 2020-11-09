import React, { useEffect } from 'react'
import { facebook } from '../../api/facebook'
import { List, Select } from 'antd';
const { Option } = Select;
import { currency } from '../../api/utility'
import { accountState, accountsState, userState, viewState } from '../state/atoms'
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { filter, head, map } from 'lodash'

const AccountsView = () => {

    const user = useRecoilValue(userState)
    const [accounts, setAccounts] = useRecoilState(accountsState)
    const setAccount = useSetRecoilState(accountState)
    const setView = useSetRecoilState(viewState)

    useEffect(() => {
        if (user) {
            let { accessToken } = user
            facebook.accounts.get({ access_token: accessToken, had_delivery: true })
                .subscribe(accounts => setAccounts(accounts))
        }
    }, [])

    const onSelectAccount = (val) => {
        console.log('onSelectAccount')
        let account = head(filter(accounts, act => act.account_id == val))
        setAccount(account)
        setView('account')
    }

    return (
        <div className="accounts_container">

            <div className="pick_an_ad_account">
                Select An Ad Account
            </div>

            <Select style={{ width: '75%' }} onChange={onSelectAccount} size='large'>
                {map(accounts, account => (
                    <Option value={account.account_id}>
                        {account.name}
                    </Option>
                ))}
            </Select>
        </div>
    )
}

export default AccountsView