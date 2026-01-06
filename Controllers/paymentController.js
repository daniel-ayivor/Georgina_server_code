

const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Order = require('../Models/orderModel');
const OrderItem = require('../Models/orderItemModel');
const Product = require('../Models/productModel');
const User = require('../Models/userModel');
const nodemailer = require('nodemailer');

// Create Checkout Session for Embedded Checkout
const createEmbeddedCheckout = async (req, res) => {
    const { productId, userId, quantity, countryCode, orderId } = req.body;

    try {
        let order;
        
        // If orderId is provided, use existing order; otherwise create new one
        if (orderId) {
            order = await Order.findByPk(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
        } else {
            // Legacy flow: create order from product details
            const product = await Product.findByPk(productId);
            const user = await User.findByPk(userId);

            if (!product || !user) {
                return res.status(404).json({ message: 'Product or User not found' });
            }

            const totalAmount = product.price * quantity;
            
            // Create order
            order = await Order.create({
                userId: user.id,
                totalAmount,
                status: 'pending'
            });

            // Create order item with product image
            await OrderItem.create({
                orderId: order.id,
                productId: product.id,
                productName: product.name,
                image: product.images && product.images.length > 0 ? product.images[0] : null,
                quantity: quantity,
                price: parseFloat(product.price)
            });
        }

        // Fetch order with items for Stripe session
        const fullOrder = await Order.findByPk(order.id, {
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product'
                }]
            }]
        });

        const user = await User.findByPk(order.userId);
        
        // Determine currency based on country code
        let currency = 'eur';
        
        if (countryCode === 'GB') {
            currency = 'gbp';
        } else if (countryCode === 'US') {
            currency = 'usd';
        } else if (countryCode === 'CH') {
            currency = 'chf';
        } else if (countryCode === 'NO' || countryCode === 'SE' || countryCode === 'DK') {
            currency = countryCode === 'NO' ? 'nok' : countryCode === 'SE' ? 'sek' : 'dkk';
        }
        
        // Build line items from order items
        const lineItems = fullOrder.items.map(item => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: item.productName,
                    description: item.product?.description || '',
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        // Stripe Checkout Session for EMBEDDED checkout
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded', // KEY CHANGE: Enable embedded mode
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            return_url: `${process.env.SUCCESS_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-return?session_id={CHECKOUT_SESSION_ID}`,
            metadata: { 
                orderId: order.id.toString(),
                userId: order.userId.toString()
            },
            customer_email: user.email,
        });

        // Update order with session ID
        order.paymentIntentId = session.id;
        await order.save();

        // Return client secret for embedded checkout
        return res.json({ 
            clientSecret: session.client_secret, // Frontend needs this
            orderId: order.id,
            sessionId: session.id
        });

    } catch (error) {
        console.error('Error creating embedded checkout:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};


const PaymentIntent = async (req, res) => {
    const { productId, userId, quantity, countryCode, paymentIntentMode, orderId } = req.body;

    try {
        let order;
        let user;
        
        // If orderId is provided, use existing order
        if (orderId) {
            order = await Order.findByPk(orderId, {
                include: [{
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                }]
            });
            
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            user = await User.findByPk(order.userId);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
        } else {
            // Legacy flow: create order from product details
            const product = await Product.findByPk(productId);
            user = await User.findByPk(userId);

            if (!product || !user) {
                return res.status(404).json({ message: 'Product or User not found' });
            }

            const totalAmount = product.price * quantity;

            const totalAmount = product.price * quantity;

        // Determine currency based on country code
        let currency = 'eur'; // Default to EUR for Europe
        
        if (countryCode === 'GB') {
            currency = 'gbp';
        } else if (countryCode === 'US') {
            currency = 'usd';
        } else if (countryCode === 'CH') {
            currency = 'chf';
        } else if (countryCode === 'NO' || countryCode === 'SE' || countryCode === 'DK') {
            currency = countryCode === 'NO' ? 'nok' : countryCode === 'SE' ? 'sek' : 'dkk';
        } else if (countryCode === 'GH') {
            currency = 'ghs';
        }

        // Check if we should create a PaymentIntent (for embedded Elements)
        if (paymentIntentMode) {
            // If no existing order, create one
            if (!orderId) {
                order = await Order.create({
                    userId: user.id,
                    totalAmount,
                    status: 'pending'
                });

                // Create order item with product image
                await OrderItem.create({
                    orderId: order.id,
                    productId: product.id,
                    productName: product.name,
                    image: product.images && product.images.length > 0 ? product.images[0] : null,
                    quantity: quantity,
                    price: parseFloat(product.price)
                });
            }
            
            const orderTotal = orderId ? order.totalAmount : totalAmount;
            
            // Create a REAL PaymentIntent for embedded Elements
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(orderTotal * 100), // Amount in cents
                currency: currency,
                metadata: {
                    orderId: order.id.toString(),
                    userId: user.id.toString(),
                },
                automatic_payment_methods: {
                    enabled: true,
                },
                description: orderId ? `Order #${order.orderNumber}` : `Purchase of ${product.name} (x${quantity})`,
                receipt_email: user.email,
            });

            // Update order with payment intent ID
            order.paymentIntentId = paymentIntent.id;
            await order.save();

            return res.json({ 
                clientSecret: paymentIntent.client_secret, // This will start with pi_
                paymentIntentId: paymentIntent.id,
                orderId: order.id,
                type: 'payment_intent'
            });
        } else {
            // If no existing order, create one
            if (!orderId) {
                order = await Order.create({
                    userId: user.id,
                    totalAmount,
                    status: 'pending'
                });

                // Create order item with product image
                await OrderItem.create({
                    orderId: order.id,
                    productId: product.id,
                    productName: product.name,
                    image: product.images && product.images.length > 0 ? product.images[0] : null,
                    quantity: quantity,
                    price: parseFloat(product.price)
                });
            }
            
            // Build line items from order
            const fullOrder = await Order.findByPk(order.id, {
                include: [{
                    model: OrderItem,
                    as: 'items',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                }]
            });
            
            const lineItems = fullOrder.items.map(item => ({
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.productName,
                        description: item.product?.description || '',
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.quantity,
            }));
            
            // Original CheckoutSession logic (for redirect flow)
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${process.env.SUCCESS_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CANCEL_URL}/payment-failed`,
                metadata: { 
                    orderId: order.id.toString(),
                    userId: user.id.toString()
                },
                customer_email: user.email, 
            });

            // Update order with session ID
            order.paymentIntentId = session.id;
            await order.save();

            return res.json({ 
                url: session.url, 
                orderId: order.id,
                sessionId: session.id,
                clientSecret: session.client_secret, // This starts with cs_
                type: 'checkout_session'
            });
        }

    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

// Legacy redirect-based checkout (keep for backward compatibility)
// const PaymentIntent = async (req, res) => {
//     const { productId, userId, quantity, countryCode } = req.body;

//     try {
//         const product = await Product.findByPk(productId);
//         const user = await User.findByPk(userId);

//         if (!product || !user) {
//             return res.status(404).json({ message: 'Product or User not found' });
//         }

//         const totalAmount = product.price * quantity;

//         let currency = 'eur';
        
//         if (countryCode === 'GB') {
//             currency = 'gbp';
//         } else if (countryCode === 'US') {
//             currency = 'usd';
//         } else if (countryCode === 'CH') {
//             currency = 'chf';
//         } else if (countryCode === 'NO' || countryCode === 'SE' || countryCode === 'DK') {
//             currency = countryCode === 'NO' ? 'nok' : countryCode === 'SE' ? 'sek' : 'dkk';
//         }
        
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: [
//                 {
//                     price_data: {
//                         currency: currency, 
//                         product_data: {
//                             name: product.name,
//                             description: product.description || '',
//                         },
//                         unit_amount: Math.round(totalAmount * 100),
//                     },
//                     quantity,
//                 },
//             ],
//             mode: 'payment',
//             success_url: `${process.env.SUCCESS_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${process.env.CANCEL_URL}/payment-failed`,
//             metadata: { 
//                 productId: productId.toString(), 
//                 userId: userId.toString(),
//                 orderId: ''
//             },
//             customer_email: user.email, 
//         });

//         const order = await Order.create({
//             userId: user.id,
//             productId: product.id,
//             totalAmount,
//             paymentIntentId: session.id,
//             status: 'pending'
//         });

//         await stripe.checkout.sessions.update(session.id, {
//             metadata: {
//                 productId: productId.toString(),
//                 userId: userId.toString(),
//                 orderId: order.id.toString()
//             }
//         });

//         return res.json({ 
//             url: session.url, 
//             orderId: order.id,
//             sessionId: session.id 
//         });

//     } catch (error) {
//         console.error('Error creating payment intent:', error);
//         res.status(500).json({ 
//             message: 'Internal server error', 
//             error: error.message 
//         });
//     }
// };

// Retrieve session status (for confirming payment on return)
const getSessionStatus = async (req, res) => {
    const { session_id } = req.query;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        return res.json({
            status: session.status,
            payment_status: session.payment_status,
            customer_email: session.customer_email,
            amount_total: session.amount_total,
            currency: session.currency
        });
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).json({ 
            message: 'Error retrieving session status',
            error: error.message 
        });
    }
};

const sendEmail = async (userEmail, subject, text) => {
    try {
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
        
        console.log(`Email sent to ${userEmail}`);
    } catch (error) {
        console.error('Email sending error:', error);
    }
};

// Stripe Webhook Handler
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                
                console.log('✅ Payment successful for session:', session.id);
                
                const order = await Order.findOne({ 
                    where: { paymentIntentId: session.id } 
                });

                if (order) {
                    order.status = 'paid';
                    await order.save();

                    const user = await User.findByPk(order.userId);
                    const product = await Product.findByPk(order.productId);
                    
                    if (user) {
                        const amount = (session.amount_total / 100).toFixed(2);
                        const currency = session.currency.toUpperCase();
                        
                        await sendEmail(
                            user.email,
                            "Payment Confirmation - Order Successful",
                            `Dear ${user.name || user.email},\n\nYour payment was successful!\n\nOrder Details:\n- Order ID: ${order.id}\n- Product: ${product?.name || 'N/A'}\n- Amount: ${amount} ${currency}\n- Status: Paid\n- Payment Date: ${new Date().toLocaleString()}\n\nThank you for your purchase!\n\nBest regards,\nGeorgina Services Limited`
                        );
                    }

                    console.log(`✅ Order ${order.id} marked as paid and email sent`);
                } else {
                    console.log('⚠️ Order not found for session:', session.id);
                }
                break;

            case 'checkout.session.expired':
                const expiredSession = event.data.object;
                
                const expiredOrder = await Order.findOne({ 
                    where: { paymentIntentId: expiredSession.id } 
                });

                if (expiredOrder && expiredOrder.status === 'pending') {
                    expiredOrder.status = 'expired';
                    await expiredOrder.save();
                    console.log(`⏰ Order ${expiredOrder.id} marked as expired`);
                }
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                
                const failedOrder = await Order.findOne({ 
                    where: { paymentIntentId: failedPayment.id } 
                });

                if (failedOrder) {
                    failedOrder.status = 'failed';
                    await failedOrder.save();
                    
                    const user = await User.findByPk(failedOrder.userId);
                    if (user) {
                        await sendEmail(
                            user.email,
                            "Payment Failed - Action Required",
                            `Dear ${user.name || user.email},\n\nUnfortunately, your payment for order ${failedOrder.id} was unsuccessful.\n\nReason: ${failedPayment.last_payment_error?.message || 'Payment declined'}\n\nPlease try again or contact our support team if you need assistance.\n\nBest regards,\nGeorgina Services Limited`
                        );
                    }
                    
                    console.log(`❌ Order ${failedOrder.id} marked as failed`);
                }
                break;

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// Confirm payment manually (for embedded checkout return)
const confirmPayment = async (req, res) => {
    const { sessionId } = req.body;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const order = await Order.findOne({ 
            where: { paymentIntentId: sessionId } 
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (session.payment_status === 'paid') {
            // Only update if not already paid (avoid duplicate emails)
            if (order.status !== 'paid') {
                order.status = 'paid';
                await order.save();
                
                const user = await User.findByPk(order.userId);
                const product = await Product.findByPk(order.productId);
                
                if (user) {
                    const amount = (session.amount_total / 100).toFixed(2);
                    const currency = session.currency.toUpperCase();
                    
                    await sendEmail(
                        user.email,
                        "Payment Confirmation - Order Successful",
                        `Dear ${user.name || user.email},\n\nYour payment was successful!\n\nOrder Details:\n- Order ID: ${order.id}\n- Product: ${product?.name || 'N/A'}\n- Amount: ${amount} ${currency}\n- Status: Paid\n\nThank you for your purchase!\n\nBest regards,\nGeorgina Services Limited`
                    );
                }
            }

            return res.json({ 
                success: true,
                message: 'Payment confirmed successfully', 
                order,
                paymentStatus: session.payment_status 
            });
        } else {
            return res.status(400).json({ 
                success: false,
                message: 'Payment not completed', 
                status: session.payment_status 
            });
        }
    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
};

module.exports = { 
    PaymentIntent,              // Legacy redirect checkout
    createEmbeddedCheckout,     // New embedded checkout
    getSessionStatus,           // Check session status
    confirmPayment,             // Manual payment confirmation
    stripeWebhook              // Webhook handler
};