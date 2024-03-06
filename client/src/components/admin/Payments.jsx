import React, { useEffect, useState } from "react";
import axios from "axios";
import { GiTakeMyMoney } from "react-icons/gi";
const Payments = () => {
  const [paymentdata, setPaymentdata] = useState([]);

  const fetchpayments = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/get-payment",
        "payments"
      );
      setPaymentdata(response.data.data);
    } catch (error) {
      console.log("Error fetching payments:", error);
    }
  };

  useEffect(() => {
    fetchpayments();
  }, []);

  const calculateTotalAmount = (timeFrame) => {
    const currentDate = new Date();
    const timeFrameMs = timeFrame * 24 * 60 * 60 * 1000; // Convert to milliseconds
    const filteredPayments = paymentdata.filter((payment) => {
      const paymentDate = new Date(payment.date);
      return currentDate - paymentDate <= timeFrameMs && payment.isPremium;
    });
    const totalAmount = filteredPayments.reduce((acc, payment) => {
      return acc + (payment.plan === "monthly" ? 49 : 499);
    }, 0);
    return totalAmount;
  };

  const totalAmountYear = calculateTotalAmount(365);
  const totalAmountMonth = calculateTotalAmount(30);
  const totalAmountWeek = calculateTotalAmount(7);
  const totalAmountDay = calculateTotalAmount(1);

  return (
    <div className="main-book relative overflow-hidden flex flex-col">
      <div className="main-cards">
        <div className="card">
          <div className="card-inner">
            <h3>Yearly Collected Total</h3>
            <GiTakeMyMoney className="card_icon" size={100} />
          </div>
          <h1>₹{totalAmountYear}</h1>
        </div>

        <div className="carda">
          <div className="card-inner">
            <h3>Monthly Collection Total</h3>
            <GiTakeMyMoney className="card_icon" size={100} />
          </div>
          <h1>₹{totalAmountMonth}</h1>
        </div>

        <div className="cardu">
          <div className="card-inner">
            <h3>Total Collected Weekly</h3>
            <GiTakeMyMoney className="card_icon" size={100} />
          </div>
          <h1>₹{totalAmountWeek}</h1>
        </div>

        <div className="cardg">
          <div className="card-inner">
            <h3>Today's Collection</h3>
            <GiTakeMyMoney className="card_icon" size={100} />
          </div>
          <h1>₹{totalAmountDay}</h1>
        </div>
      </div>
      <h1 className="tbhead text-3xl -mb-10">Payment Details</h1>
      <div className="scrollDi">
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>User Id</th>
                <th>Payment Id</th>
                <th>Plan</th>
                <th>Date</th>
                <th>Premium</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentdata.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.userId}</td>
                  <td>{payment.paymentId}</td>
                  <td>{payment.plan}</td>
                  <td>{payment.date}</td>
                  <td className="Mtbim">
                    {payment.isPremium ? "True" : "False"}
                  </td>
                  <td className="ptbdesp">{payment.expiryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* <div className="flex gap-4 mt-8">
        <div className="payment-card">
          <h2>Total Amount Collected in a Year:</h2>
          <p>{totalAmountYear}</p>
        </div>
        <div className="payment-card">
          <h2>Total Amount Collected in a Month:</h2>
          <p>${totalAmountMonth}</p>
        </div>
        <div className="payment-card">
          <h2>Total Amount Collected in a Week:</h2>
          <p>${totalAmountWeek}</p>
        </div>
        <div className="payment-card">
          <h2>Total Amount Collected Today:</h2>
          <p>${totalAmountDay}</p>
        </div>
      </div> */}
    </div>
  );
};

export default Payments;
