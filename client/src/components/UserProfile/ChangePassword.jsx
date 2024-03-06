// ChangePassword.jsx

import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios"; // Import axios for making HTTP requests

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const uData = JSON.parse(window.localStorage.getItem("user"));

  const handleSaveChanges = async () => {
    try {
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New Passwords do not match.");
        return;
      }
      const response = await axios.post(
        `http://localhost:3001/reset-password/${uData?._id}/${oldPassword}`,
        {
          // userId,
          resetAction: "setNewPswd",
          password: newPassword,
        }
      );
      alert(response.data.message);
      if (response.data.status == "ok") {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error changing password : ", error);
      setError("An error occurred while changing the password.");
    }
  };

  return (
    <div className="pcaccountsettings">
      <h1 className="pcmainhead1">Change Password</h1>

      <div className="pcform">
        <div className="pcform-group">
          <label htmlFor="oldpass">
            Old Password <span>*</span>
          </label>
          <div className="password-input-container flex items-center justify-center gap-2">
            <input
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <div
              className="eye-icon text-2xl"
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        <div className="pcform-group">
          <label htmlFor="newpass">
            New Password <span>*</span>
          </label>
          <div className="password-input-container flex items-center justify-center gap-2">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div
              className="eye-icon text-2xl"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        <div className="pcform-group">
          <label htmlFor="confirmpass">
            Confirm Password <span>*</span>
          </label>
          <div className="password-input-container flex items-center justify-center gap-2">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              
            />
            <div
              className="eye-icon text-2xl"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <button className="pcmainbutton1" onClick={handleSaveChanges}>
        Save Changes
      </button>
    </div>
  );
};

export default ChangePassword;
