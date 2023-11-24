const Order = require('../models/order');
const Product = require('../models/product');
const sendEmail = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.newOrder = async (req, res, next) => {

    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo

    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    const itemsList = orderItems.map(item => `
    <tr>
        <td><img src="${item.image}" style="width:100px; height:100px;"/></td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>₱ ${item.price}</td>
        <td>₱ ${item.quantity * item.price}</td>   
    </tr>  
    `).join('');

    const confirmationLink = `<a href="http://localhost:4002/api/v1/confirm-order?orderId=${order._id}&userEmail=${req.user.email}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Confirm Order</a>`;

    const message = `
    <html>
    <style>
        table, th, td {
            border:1px solid black;
        }
        td{
            text-align: center;
        }
    </style>
    <body>  
        There is a new order from ${req.user.name}
        <p>Order Details:</p>
        <table style="width:100%">
            <tr>
                <th>Image</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
            </tr>
            ${itemsList}
        </table>
        <p>Shipping Information: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.country}, ${shippingInfo.postalCode}</p>
        <p>Phone Number: ${shippingInfo.phoneNo}</p>
        <p>Items Price: ₱ ${itemsPrice}</p>
        <p>Tax Price: ₱ ${taxPrice}</p>
        <p>Shipping Price: ₱ ${shippingPrice}</p>
        <p>Total Price: ₱ ${totalPrice}</p>
        ${confirmationLink}
    </body>
    </html> 
    `;


    await sendEmail({
        email: 'kickz@gmail.com',
        subject: 'New Order Notification',
        message
    })

    res.status(200).json({
        success: true,
        order,
        message: `Email sent to: kickz@gmail.com`
    })
}

// exports.confirmOrder = async (req, res, next) => {
//     const { orderId, userEmail } = req.query;

//     try {
//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found'
//             });
//         }

//         const itemsList = order.orderItems.map(item => `
//         <tr>
//             <td><img src="${item.image}" style="width:100px; height:100px;"/></td>
//             <td>${item.name}</td>
//             <td>${item.quantity}</td>
//             <td>₱ ${item.price}</td>
//             <td>₱ ${item.quantity * item.price}</td>   
//         </tr>  
//         `).join('');

//         const message = `
//         <html>
//         <style>
//             table, th, td {
//                 border:1px solid black;
//             }
//             td{
//                 text-align: center;
//             }
//         </style>
//         <body>  
//             Your order has been confirmed. Thank you for shopping with us!
//             <p>Order Details:</p>
//             <table style="width:100%">
//                 <tr>
//                     <th>Image</th>
//                     <th>Item Name</th>
//                     <th>Quantity</th>
//                     <th>Price</th>
//                     <th>Total</th>
//                 </tr>
//                 ${itemsList}
//             </table>
//             <p>Shipping Information: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.country}, ${order.shippingInfo.postalCode}</p>
//             <p>Phone Number: ${order.shippingInfo.phoneNo}</p>
//             <p>Items Price: ₱ ${order.itemsPrice}</p>
//             <p>Tax Price: ₱ ${order.taxPrice}</p>
//             <p>Shipping Price: ₱ ${order.shippingPrice}</p>
//             <p>Total Price: ₱ ${order.totalPrice}</p>
//         </body>
//         </html>`;

//         await sendEmail({
//             email: userEmail,
//             subject: 'Your Order has been Confirmed',
//             message
//         });

//         res.status(200).json({
//             success: true,
//             message: `Order confirmation email sent to: ${userEmail}`
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal Server Error'
//         });
//     }
// };

exports.confirmOrder = async (req, res, next) => {
    const { orderId, userEmail } = req.query;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const message = `<p>Your order has been confirmed!</p>
        <p>Click the attachment below, for your receipt</p>`;

        // Create a PDF document
        const pdfDoc = new PDFDocument();
        const pdfFilePath = `./order_confirmation_${orderId}.pdf`;
        const pdfStream = fs.createWriteStream(pdfFilePath);

        const itemsList = order.orderItems.map(item => `
            pdfDoc.text(${item.name})
            pdfDoc.text(${item.quantity})
            pdfDoc.text(${item.price})
            pdfDoc.text(${item.quantity * item.price})
        `).join('');

        pdfDoc.pipe(pdfStream);

        pdfDoc.text('Your order has been confirmed. Thank you for shopping with us!');
        pdfDoc.text('Order Details:');
        pdfDoc.text(`${itemsList}`);
        pdfDoc.text(`Shipping Information: ${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.country}, ${order.shippingInfo.postalCode}`);
        pdfDoc.text(`Phone Number: ${order.shippingInfo.phoneNo}`);
        pdfDoc.text(`Items Price: Php.${order.itemsPrice}`);
        pdfDoc.text(`Tax Price:  Php.${order.taxPrice}`);
        pdfDoc.text(`Shipping Price: Php.${order.shippingPrice}`);
        pdfDoc.text(`Total Price:  Php.${order.totalPrice}`);

        pdfDoc.end();

        await sendEmail({
            email: userEmail,
            subject: 'Your Order has been Confirmed',
            message,
            attachments: [{
                filename: 'order_confirmation.pdf',
                path: pdfFilePath,
                encoding: 'base64',
            }],
        });

        res.status(200).json({
            success: true,
            message: `Order confirmation email with PDF sent to: ${userEmail}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


exports.getSingleOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if (!order) {
        return res.status(404).json({ message: `No order found with this ID` })

    }

    res.status(200).json({
        success: true,
        order
    })
}

exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })

    res.status(200).json({
        success: true,
        orders
    })
}

exports.allOrders = async (req, res, next) => {
    const orders = await Order.find()

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}

exports.updateOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (order.orderStatus === 'Delivered') {
        return res.status(404).json({ message: `You have already delivered this order` })

    }

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status
    order.deliveredAt = Date.now()
    await order.save()

    res.status(200).json({
        success: true,
    })
}

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save({ validateBeforeSave: false })
}

exports.deleteOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
        return res.status(404).json({ message: `No Order found with this ID` })

    }
    await order.remove()

    res.status(200).json({
        success: true
    })
}

exports.customerSales = async (req, res, next) => {
    const customerSales = await Order.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            },
        },

        { $unwind: "$userDetails" },

        {
            $group: {
                _id: "$userDetails.name",
                total: { $sum: "$totalPrice" }
            }
        },

        { $sort: { total: -1 } },
        { $limit: 5 }
    ])
    console.log(customerSales)
    if (!customerSales) {
        return res.status(404).json({
            message: 'error customer sales',
        })
    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        customerSales
    })

}

exports.salesPerMonth = async (req, res, next) => {
    const salesPerMonth = await Order.aggregate([
        {
            $group: {
                // _id: {month: { $month: "$paidAt" } },
                _id: {
                    year: { $year: "$paidAt" },
                    month: { $month: "$paidAt" }
                },
                total: { $sum: "$totalPrice" },
            },
        },

        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', ' Sept', 'Oct', 'Nov', 'Dec']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', "$_id.month"]
                        }
                    }
                }
            }
        },
        { $sort: { "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                month: 1,
                total: 1,
            }
        }

    ])
    if (!salesPerMonth) {
        return res.status(404).json({
            message: 'error sales per month',
        })
    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        salesPerMonth
    })

}