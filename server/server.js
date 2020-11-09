import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import passport from 'passport'
import db, { base } from '../firebase'
import scope from '../api/fbscopes'
import { Strategy as FacebookStrategy } from "passport-facebook";
import { facebookapi } from '../api/facebook'
import { show } from '../api/utility'
import shajs from 'sha.js'
const stripe = require('stripe')('sk_test_51Hb7UlJkzTqw8a2xg81gRQuvY5jW1hIx0hDw4TMjHL5W0BSQaZXrrkJ9Vraqn1dPzA6oUvx4a1OV5BdiwMFZEGuP00hQlCvIKY')

var port = process.env.PORT || 3000;
var app = express()
var server = http.createServer(app)
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// FACEBOOK

app.post('/adsets', (req, res) => {
    console.log('reqbody')
    console.log(req.body)
})

// PASSPORT STRATEGIES

passport.use(new FacebookStrategy({
    clientID: '655759268343224',
    clientSecret: '7a3157113bcbf5664409832f41ccbde5',
    callbackURL: "http://localhost:3000/auth/facebook/callback"
}, async (accessToken, refreshToken, profile, cb) => {
    let { id, displayName } = profile
    let payload = { accessToken, id, displayName }
    db.collection('facebook').doc(profile.id).set(payload)
        .then(() => console.log('saved fb tokens'))
}));

// ROUTES

app.get('/auth/facebook', (req, res, next) => {
    passport.authenticate('facebook', { scope })
});

app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => res.redirect('https://adguru.ai/')
)

// STRIPE

app.post(
    '/stripe-webhook',
    bodyParser.raw({ type: 'application/json' }),
    async (req, res) => {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                req.headers['stripe-signature'],
                'pk_test_51Hb7UlJkzTqw8a2xLdXYVa0fm56ye4XL7DjeE4Jf7UbXTOUhNQKNNTnkmWOa1GB0URnrPWOBjxWwk3Efo90UYidT00QlRcPEcx'
            );
        } catch (err) {
            console.log(err);
            console.log(`⚠️  Webhook signature verification failed.`);
            console.log(
                `⚠️  Check the env file and enter the correct webhook secret.`
            );
            return res.sendStatus(400)
        }
        // Extract the object from the event.
        const dataObject = event.data.object;

        console.log('dataObject')
        console.log(dataObject)

        // Handle the event
        // Review important events for Billing webhooks
        // https://stripe.com/docs/billing/webhooks
        // Remove comment to see the various objects sent for this sample
        switch (event.type) {
            case 'invoice.paid':
                // Used to provision services after the trial has ended.
                // The status of the invoice will show up as paid. Store the status in your
                // database to reference when a user accesses your service to avoid hitting rate limits.
                break;
            case 'invoice.payment_failed':
                // If the payment fails or the customer does not have a valid payment method,
                //  an invoice.payment_failed event is sent, the subscription becomes past_due.
                // Use this webhook to notify your user that their payment has
                // failed and to retrieve new card details.
                break;
            case 'customer.subscription.deleted':
                if (event.request != null) {
                    // handle a subscription cancelled by your request
                    // from above.
                } else {
                    // handle subscription cancelled automatically based
                    // upon your subscription settings.
                }
                break;
            default:
            // Unexpected event type
        }
        res.sendStatus(200)
    }
)

app.post('/create-customer', async (req, res) => {
    // Create a new customer object
    const customer = await stripe.customers.create({
        email: req.body.email,
    })

    console.log('createCustomerResponse')
    console.log(customer)

    // save the customer.id as stripeCustomerId
    // in your database.

    res.send({ customer })
});

app.post('/create-card', async (req, res) => {
    // Create a new customer object
    let { source } = req.body
    console.log(source)
    const card = await stripe.customers.createSource(
        'cus_IDLvo9gD3aGZBX',
        { source: "tok_visa_debit" }
    )

    console.log('createCardResponse')
    console.log(card)

    res.send({ card })
});

app.post('/create-subscription', async (req, res) => {
    // Set the default payment method on the customer

    let { paymentMethodId, customerId, priceId, quantity } = req.body
    console.log('here')
    try {
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
    } catch (error) {
        return res.status('402').send({ error: { message: error.message } });
    }
    console.log('here')
    let updateCustomerDefaultPaymentMethod = await stripe.customers.update(
        customerId,
        {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        }
    );

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
            { price: priceId, quantity },
        ],
        expand: ['latest_invoice.payment_intent', 'plan.product'],
    });

    console.log('createSubscription')
    console.log(subscription)

    res.send(subscription);
});

app.post('/update-subscription', async (req, res) => {
    // Set the default payment method on the customer

    let { subscriptionId, priceId, quantity } = req.body
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
        proration_behavior: 'create_prorations',
        items: [{
            id: subscription.items.data[0].id,
            price: priceId,
            quantity
        }]
    });

    console.log('createSubscription')
    console.log(subscription)

    res.send(subscription);
});

// SERVER INIT

server.listen(
    port,
    () => console.log(`🚀 Listening on port ${port}!`)
) 