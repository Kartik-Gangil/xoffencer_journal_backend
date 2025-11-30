const dotenv = require('dotenv');
dotenv.config();
const Razorpay = require('razorpay')



const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || ""
})



async function createOrder(amount) {
    try {
        const options = {
            amount: amount * 100, // amount in paise (₹1 = 100 paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options); //creating an order for the particular submission
        return order;
    } catch (error) {
        console.error({ error })
    }
}
module.exports = createOrder;