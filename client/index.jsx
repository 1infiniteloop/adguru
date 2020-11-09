import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import AppLayout from './app/AppLayout'
import Checkout from './app/Checkout'
import LandingPage from './landers/LandingPage.jsx'
import Privacy from './site/Privacy.jsx'
import Tos from './site/Tos.jsx'
import db, { auth } from '../firebase'
import { userState, viewState } from './state/atoms'
import { RecoilRoot, useSetRecoilState, useRecoilValue } from 'recoil'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Cookies from 'js-cookie'
const stripePromise = loadStripe("pk_test_51Hb7UlJkzTqw8a2xLdXYVa0fm56ye4XL7DjeE4Jf7UbXTOUhNQKNNTnkmWOa1GB0URnrPWOBjxWwk3Efo90UYidT00QlRcPEcx")
import './style.css'

const Routes = () => {

    const view = useRecoilValue(viewState)
    const user = useRecoilValue(userState)

    if (window.location.pathname == '/checkout') {
        return <Checkout />
    }

    if (view == 'privacy') {
        return <Privacy />
    }

    if (view == 'tos') {
        return <Tos />
    }

    if (user) {
        return <AppLayout />
    }

    return <LandingPage />
}

const Root = () => {
    const admin = Cookies.get('admin')

    const setUser = useSetRecoilState(userState)

    const onSignOut = () => auth.signOut().then(() => setUser(null))

    const onUnlinkAccount = () => {
        let current_user = auth.currentUser
        current_user.delete().then(() => setUser(null))
    }

    useEffect(() => {
        if(admin == 'thrace'){
            db.collection('facebook').doc('3eAQQnEdI6hGFI8ywIuXNOQJnNg1')
            .get()
            .then(user => setUser(user.data()))
        }

        auth.onAuthStateChanged(res => {
            if (res?.uid) {
                db.collection('facebook').doc(res.uid)
                    .get()
                    .then(user => setUser(user.data()))
            }
        })
    }, [])

    return <Routes />
}

ReactDOM.render(
    <RecoilRoot>
        <React.Suspense fallback={<div>Loading...</div>}>
            <Elements stripe={stripePromise}>
                <Root />
            </Elements>
        </React.Suspense>
    </RecoilRoot>,
    document.getElementById('root')
)