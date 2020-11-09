import React from 'react'
import Logo from '../static/adguru_logo.png'
import LoginWithFacebokButton from '../static/login_with_facebook_btn.jpg'
import { join } from 'lodash'
import db, { database, auth } from '../../firebase'
import scopes from '../../api/fbscopes'
import { viewState } from '../state/atoms'
import { useSetRecoilState } from 'recoil'
const provider = new database.auth.FacebookAuthProvider();
provider.addScope(join(scopes, ','))

const LandingPage = () => {
    const setView = useSetRecoilState(viewState)

    const onLogin = () => auth.signInWithPopup(provider)
        .then(({ credential = {}, additionalUserInfo = {}, user = {} }) => {
            let { profile } = additionalUserInfo
            let { accessToken } = credential
            if (user?.uid) {
                db.collection('facebook').doc(user.uid)
                    .set({ accessToken, profile, uid: user.uid }, { merge: true })
                    .then(() => console.log('saved user'))
            }
        })

    return (
        <div className="landing_page_container">
            <div className="landing_page_logo_container">
                <img src={Logo} alt="logo" />
            </div>
            <div className="login_button_container">
                <a onClick={onLogin} className="login_button">
                    <img src={LoginWithFacebokButton} alt="login button img" />
                </a>
            </div>
            <div className="footer_links_container">
                <a onClick={() => setView('privacy')}>
                    Privacy Policy
                </a>
            </div>
        </div>
    )
}

export default LandingPage;