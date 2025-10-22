const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const axios = require('axios'); // For MoMo API calls
const Order = require('../Models/userModel');
const Product = require('../Models/productModel');
const User = require('../Models/userModel');
const nodemailer = require('nodemailer');

// const PaymentIntent = async (req, res) => {
//     const { productId, userId, quantity, paymentMethod } = req.body;

//     try {
//         const product = await Product.findByPk(productId);
//         const user = await User.findByPk(userId);

//         if (!product || !user) {
//             return res.status(404).json({ message: 'Product or User not found' });
//         }

//         const totalAmount = product.price * quantity;

//         if (paymentMethod === 'stripe') {
//             // Stripe Checkout Session
//             const session = await stripe.checkout.sessions.create({
//                 payment_method_types: ['card'],
//                 line_items: [
//                     {
//                         price_data: {
//                             currency: 'usd',
//                             product_data: {
//                                 name: product.name,
//                             },
//                             unit_amount: totalAmount * 100,
//                         },
//                         quantity,
//                     },
//                 ],
//                 mode: 'payment',
//                 success_url: `${process.env.SUCCESS_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//                 cancel_url: `${process.env.CANCEL_URL}/payment-failed`,
//                 metadata: { productId, userId },
//                 customer_email: user.email, 
//             });

//             const order = await Order.create({
//                 UserId: user.id,
//                 ProductId: product.id,
//                 totalAmount,
//                 paymentIntentId: session.id,
//                 status: 'pending'
//             });

//             return res.json({ url: session.url, orderId: order.id });
//         } 

//         // MoMo payment remains unchanged
//         // MoMo does not have built-in redirect URLs, so you'd handle success/failure manually

//     } catch (error) {
//         console.error('Error creating payment intent:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };


const PaymentIntent = async (req, res) => {
    const { productId, userId, quantity, paymentMethod, countryCode } = req.body;

    try {
        const product = await Product.findByPk(productId);
        const user = await User.findByPk(userId);

        if (!product || !user) {
            return res.status(404).json({ message: 'Product or User not found' });
        }

        const totalAmount = product.price * quantity;

        if (paymentMethod === 'stripe_card') {
            // Determine currency based on the user's country
            const currency = countryCode === 'GH' ? 'ghs' : 'usd';
            
            // Stripe Checkout Session for card payments
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: currency, 
                            product_data: {
                                name: product.name,
                            },
                            unit_amount: totalAmount * 100, // Amount in cents
                        },
                        quantity,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.SUCCESS_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CANCEL_URL}/payment-failed`,
                metadata: { productId, userId },
                customer_email: user.email, 
            });

            const order = await Order.create({
                UserId: user.id,
                ProductId: product.id,
                totalAmount,
                paymentIntentId: session.id,
                status: 'pending'
            });

            return res.json({ url: session.url, orderId: order.id });
        } else if (paymentMethod === 'momo_external' && countryCode === 'GH') {
            // Your existing MoMo payment logic, restricted to Ghana
            const momoResponse = await axios.post(
                `${process.env.MOMO_API_URL}/collection/v1_0/requesttopay`,
                {
                    amount: totalAmount.toString(),
                    currency: 'GHS',
                    externalId: `order_${Date.now()}`,
                    payer: {
                        partyIdType: 'MSISDN',
                        partyId: req.body.momoNumber, 
                    },
                    payerMessage: `Payment for Order ${Date.now()}`,
                    payeeNote: `Payment for Order ${Date.now()}`
                },
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY,
                        Authorization: `Bearer ${process.env.MOMO_ACCESS_TOKEN}`,
                    },
                }
            );

            const order = await Order.create({
                UserId: user.id,
                ProductId: product.id,
                totalAmount,
                paymentIntentId: momoResponse.data.transactionId, 
                status: 'pending'
            });

            return res.json({ message: 'MoMo request sent', transactionId: momoResponse.data.transactionId });
        } else {
            return res.status(400).json({ message: 'Invalid payment method or country' });
        }

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const sendEmail = async (userEmail, subject, text) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject,
        text
    });
};

const confirmPayment = async (req, res) => {
    const { paymentIntentId, paymentMethod } = req.body;

    try {
        let order;
        let user;
        let successMessage = "";

        if (paymentMethod === 'stripe') {
            const session = await stripe.checkout.sessions.retrieve(paymentIntentId);
            order = await Order.findOne({ where: { paymentIntentId } });

            if (session.payment_status === 'paid') {
                order.status = 'paid';
                await order.save();
                user = await User.findByPk(order.UserId);
                successMessage = "Your payment was successful!";
            } else {
                return res.status(400).json({ message: 'Payment not completed' });
            }
        } else if (paymentMethod === 'momo') {
            const momoResponse = await axios.get(
                `${process.env.MOMO_API_URL}/collection/v1_0/requesttopay/${paymentIntentId}`,
                {
                    headers: {
                        'Ocp-Apim-Subscription-Key': process.env.MOMO_SUBSCRIPTION_KEY,
                        Authorization: `Bearer ${process.env.MOMO_ACCESS_TOKEN}`,
                    },
                }
            );

            if (momoResponse.data.status === 'SUCCESSFUL') {
                order = await Order.findOne({ where: { paymentIntentId } });
                order.status = 'paid';
                await order.save();
                user = await User.findByPk(order.UserId);
                successMessage = "Your MoMo payment was successful!";
            } else {
                return res.status(400).json({ message: 'Payment not completed' });
            }
        }

        // Send confirmation email
        if (user) {
            await sendEmail(user.email, "Payment Confirmation", successMessage);
        }

        return res.json({ message: successMessage, order });
    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { PaymentIntent, confirmPayment };
