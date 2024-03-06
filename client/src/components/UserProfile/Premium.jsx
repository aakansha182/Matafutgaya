import React, { useEffect, useState } from "react";
import "./Premium.css";
import { FaBookOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaCrown } from "react-icons/fa";
import axios from "axios";

const SubscriptionCard = ({
  title,
  price,
  benefits,
  buttonText,
  onSubscribe,
}) => {
  return (
    <div className="subscription-card">
      <FaBookOpen size={50} style={{ margin: "0 auto" }} />
      <h3 className="card-title">{title}</h3>
      <p className="card-price">{price}</p>
      <ul className="card-benefits">
        {benefits.map((benefit, index) => (
          <li key={index}>{benefit}</li>
        ))}
      </ul>
      <button onClick={onSubscribe} className="card-button">
        {buttonText}
      </button>
    </div>
  );
};

const PremiumStatus = ({ expiryDate }) => {
  const formattedExpiryDate = new Date(expiryDate).toLocaleDateString();
  return (
    <div className="premium-status-container">
      <div className="premium-content">
        <div className="premium-badge">
          <FaCrown size={30} />
        </div>
        <h2 className="premium-congratulations">Congratulations!</h2>
        <p className="premium-welcome">Welcome to the Premium Club</p>
        <div className="premium-details">
          <p>
            Your plan will expire on:{" "}
            <span className="premium-expiry">{formattedExpiryDate}</span>
          </p>
          <p>Enjoy your exclusive premium benefits.</p>
        </div>
      </div>
    </div>
  );
};

const Premium = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [razorpayReady, setRazorpayReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    if (!window.Razorpay) {
      loadScript("https://checkout.razorpay.com/v1/checkout.js").then(
        (loaded) => {
          if (loaded) {
            console.log("Razorpay SDK loaded.");
            setRazorpayReady(true);
          } else {
            console.error("Failed to load Razorpay SDK.");
          }
        }
      );
    } else {
      setRazorpayReady(true);
    }
  }, []);

  const handleSubscribe = (planId) => {
    if (!razorpayReady) {
      console.error("Razorpay SDK is not ready.");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user"));

    const options = getOptions(planId, user);
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const getOptions = (planId, user) => {
    const planAmountPaise = planId === "monthly" ? "4900" : "49900"; // Amount in paise
    const planAmountRupees = planId === "monthly" ? "49" : "499"; // Converted to rupees for storage
    return {
      key: "rzp_test_e1jxBvUSc8OBPj",
      amount: planAmountPaise, // Keep this in paise for Razorpay processing
      currency: "INR",
      name: "Explore",
      description: "Subscription Payment",
      image: "/assests/explore.png",
      handler: function (response) {
        alert(
          `Payment successful! Payment ID: ${response.razorpay_payment_id}`
        );
        const paymentDetails = {
          amount: planAmountRupees, // Store the amount in rupees
          currency: "INR",
          userId: user?._id,
          username: user?.username, // Including the username
          paymentId: response.razorpay_payment_id,
          plan: planId,
          // Including the currency
          date: new Date().toISOString(),
        };

        fetch("http://localhost:3001/store-payment-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentDetails),
        })
          .then((response) => response.json())
          .then((data) => {
            // Update local user data with new expiry date

            axios
              .post("http://localhost:3001/get-user", { email: user.email })
              .then((res) => {
                if (res.data.status === "ok") {
                  console.log(res.data.user);
                  window.localStorage.setItem(
                    "user",
                    JSON.stringify(res.data.user)
                  );
                  setUser(res.data.user);
                } else {
                  console.log(res.data.message);
                }
              });
            console.log("Payment details stored successfully:", data);
            // navigate("/success");
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      },
      theme: {
        color: "#ff4500",
      },
    };
  };

  // Check if user is premium by comparing the current date with the expiry date
  const isUserPremium = () => {
    const currentDate = new Date();
    const expiryDate = new Date(user.expiryDate);
    return expiryDate > currentDate;
  };

  // If user is not premium anymore, downgrade their subscription to regular user
  // useEffect(() => {
  //   if (!isUserPremium()) {
  //     const updatedUser = { ...user, role2: "user" };
  //     localStorage.setItem("user", JSON.stringify(updatedUser));
  //     setUser(updatedUser);
  //   }
  // }, [user]);

  return (
    <div className="premium-container">
    <div className="text-center mb-10 max-w-[600px] mx-auto">
      <h1 className="text-3xl font-bold">Premium Subscriptions</h1>
    </div>
    
      {isUserPremium() ? (
        <PremiumStatus expiryDate={user.expiryDate} />
      ) : (
        <div className="subscriptions">
          <SubscriptionCard
            title="Monthly Subscription"
            price="₹49/month"
            benefits={[
              "Font customization",
              "Comment to a book",
              "Unlock AudioBooks",
              "Priority customer support",
            ]}
            buttonText="Subscribe Now"
            onSubscribe={() => handleSubscribe("monthly")}
          />
          <SubscriptionCard
            title="Annual Subscription"
            price="₹499/year"
            benefits={[
              "Font customization",
              "Comment to a book",
              "Unlock AudioBooks",
              "Priority customer support",
              "2 months free",
              "Unlock all features",
              "Pay once in a while and just Read",
            ]}
            buttonText="Subscribe Now"
            onSubscribe={() => handleSubscribe("annual")}
          />
        </div>
      )}
    </div>
  );
};

export default Premium;
