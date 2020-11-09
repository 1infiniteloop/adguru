import React, { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Input, Button, Divider } from 'antd';
import Logo from '../static/adguru_fb_icon.png'
import PurpleLogo from '../static/adguru_logo_purp.jpg'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.

const Checkout = () => {
    const amount = window.location.search.substring(1)
    const [error, setError] = useState(null);
    const stripe = useStripe();
    const elements = useElements();
    const [card, setCard] = useState({
        object: 'card',
        number: '',
        exp_month: '',
        exp_year: '',
        cvc: '',
        name: '',
    })
    const [email, setEmail] = useState('')

    // Handle real-time validation errors from the card Element.
    const handleChange = (event) => {
        if (event.error) {
            setError(event.error.message);
        } else {
            setError(null);
        }
    }

    const createCustomer = () => {
        let billingEmail = 'test@gmail.com'
        return fetch('http://localhost:3000/create-customer', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: billingEmail })
        })
            .then(response => response.json())
            .then(result => {
                console.log('createCustomer')
                console.log(result)
                // result.customer.id is used to map back to the customer object
                // result.setupIntent.client_secret is used to create the payment method
                return result;
            });
    }

    const createCard = () => {
        return fetch('http://localhost:3000/create-card', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: card })
        })
            .then(response => response.json())
            .then(result => {
                console.log('createCustomer')
                console.log(result)
                // result.customer.id is used to map back to the customer object
                // result.setupIntent.client_secret is used to create the payment method
                return result;
            });
    }

    const createPaymentMethod = (cardElement, customerId, priceId) => {
        return stripe
            .createPaymentMethod({
                type: 'card',
                card: cardElement,
            })
            .then((result) => {
                if (result.error) {
                    displayError(error)
                } else {
                    createSubscription({
                        customerId: customerId,
                        paymentMethodId: result.paymentMethod.id,
                        priceId: priceId,
                    })
                }
            })
    }

    const onSubscriptionComplete = (result) => {
        // Payment was successful.
        if (result.subscription.status === 'active') {
            console.log('onSubscriptionComplete')
            console.log(result)
            // Change your UI to show a success message to your customer.
            // Call your backend to grant access to your service based on
            // `result.subscription.items.data[0].price.product` the customer subscribed to.
        }
    }

    const updateSubscription = ({ subscriptionId, priceId }) => {
        priceId = 'price_1HeL2CJkzTqw8a2xaIxEL0uk'
        subscriptionId = 'sub_IEoi0UXg21nO9o'

        fetch('http://localhost:3000/update-subscription', {
            method: 'post',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                subscriptionId,
                priceId,
                quantity: 1
            })
        })
    }

    const createSubscription = ({ customerId, paymentMethodId, priceId }) => {
        console.log('createSubscription')
        customerId = "cus_IDLvo9gD3aGZBX"
        paymentMethodId = "card_1HeJNUJkzTqw8a2xCB0KeMYH"
        priceId = 'price_1HeL2CJkzTqw8a2xaIxEL0uk'
        return (
            fetch('http://localhost:3000/create-subscription', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    customerId,
                    paymentMethodId,
                    priceId,
                    quantity: 2
                }),
            })
                .then((response) => {
                    return response.json();
                })
                // If the card is declined, display an error to the user.
                .then((result) => {
                    if (result.error) {
                        // The card had an error when trying to attach it to a customer.
                        throw result;
                    }
                    return result;
                })
                // Normalize the result to contain the object returned by Stripe.
                // Add the additional details we need.
                .then((result) => {
                    return {
                        paymentMethodId: paymentMethodId,
                        priceId: priceId,
                        subscription: result,
                    };
                })
                // Some payment methods require a customer to be on session
                // to complete the payment process. Check the status of the
                // payment intent to handle these actions.
                // .then(handlePaymentThatRequiresCustomerAction)
                // If attaching this card to a Customer object succeeds,
                // but attempts to charge the customer fail, you
                // get a requires_payment_method error.
                // .then(handleRequiresPaymentMethod)
                // No more actions required. Provision your service for the user.
                .then(onSubscriptionComplete)
                .catch((error) => {
                    // An error has happened. Display the failure to the user here.
                    // We utilize the HTML element we created.
                    console.log('error')
                    console.log(error)
                    // showCardError(error);
                })
        );
    }

    // Handle form submission.
    const handleSubmit = async (event) => {
        event.preventDefault()
        const card = elements.getElement(CardElement)
        const result = await stripe.createToken(card)
        if (result.error) {
            // Inform the user if there was an error.
            setError(result.error.message)
        } else {
            setError(null);
            console.log("handleSubmit")
            console.log(result)
            // Send the token to your server.
            stripeTokenHandler(result.token)
        }
    }

    const stripeTokenHandler = async ({ id }) => {
        const response = await fetch('http://localhost:3000/charge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: id })
        })
        console.log('response')
        console.log(response.json())
        return response.json()
    }

    return (
        <div className="checkout_view_container">
            <div className="checkout_form_container">
                <div className="checkout_header_logo">
                    <img src={Logo} alt="header logo" />
                </div>
                <div className="checkout_form">
                    <form onSubmit={handleSubmit}>
                        <Divider>
                            Payment Information
                        </Divider>

                        <div class="form_row">
                            <div className="checkout_form_label">
                                Name
                            </div>

                            <Input onBlur={e => setCard(prev => ({ ...prev, name: e.target.value }))} />
                        </div>

                        <div class="form_row">
                            <div className="checkout_form_label">
                                Email
                            </div>

                            <Input onBlur={e => setEmail(e.target.value)} />
                        </div>

                        <div class="form_row">

                            <div className="checkout_form_label">
                                Credit or debit card
                            </div>

                            <Input.Group compact>
                                <Input style={{ width: '70%' }} placeholder="Card number" onBlur={e => setCard(prev => ({ ...prev, number: e.target.value }))} />
                                <Input style={{ width: '10%' }} placeholder="MM" onBlur={e => setCard(prev => ({ ...prev, exp_month: e.target.value }))} />
                                <Input style={{ width: '10%' }} placeholder="YY" onBlur={e => setCard(prev => ({ ...prev, exp_year: e.target.value }))} />
                                <Input style={{ width: '10%' }} placeholder="CVC" onBlur={e => setCard(prev => ({ ...prev, cvc: e.target.value }))} />
                            </Input.Group>

                            <div className="card-errors" role="alert">
                                {error}
                            </div>
                        </div>

                        <Button type="primary" className="submit_payment_button" onClick={createSubscription} block>
                            Submit Payment
                        </Button>

                        {/* <Button type="primary" className="submit_payment_button" onClick={updateSubscription} block>
                            Update Subscription
                        </Button> */}
                    </form>
                </div>
            </div>
            <div className="checkout_sidebar_total">
                <div className="order_summary_container">
                    <p>Order Summary</p>
                </div>
                <div className="order_product_container">
                    <div className="order_product_img">
                        <img src={PurpleLogo} />
                    </div>

                    <div className="order_product_name">
                        <p>${amount} / month</p>
                    </div>

                    {/* <div className="order_product_description">
                        <p>$500 / month</p>
                    </div> */}
                </div>

                <div className="order_total_container">
                    {/* <div className="total_row_container">
                        <p className="total_row_text">Subtotal</p>
                        <p className="total_row_value">2 x $99.00</p>
                    </div> */}
                    <div className="total_row_container">
                        <p className="total_row_text">Total Today</p>
                        <p className="total_row_value">${amount}.00</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout