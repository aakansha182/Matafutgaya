import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './AccountSettings.css';

const AccountSettings = ({ user, fetchUserData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
 // const [username, setUsername] = useState(user?.username || '');
const [name, setName] = useState(user?.name || '');
const handleFileChange = (event) => {
  setSelectedFile(event.target.files[0]);
};

 

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  {/*const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  
  const handleSubmitUsername = async (event) => {
    event.preventDefault();
    try {
      const userId = user._id;
      const response = await axios.post("http://localhost:3001/update-username", { userId, username });
      if (response.data.user) {
        fetchUserData(response.data.user.username);
        window.alert('Username changed successfully!');
      } else {
        console.error('Username update failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating the username:', error);
    }
  };
*/}

  const handleSubmitName = async (event) => {
    event.preventDefault();
    try {
      const userId = user._id; // Assuming 'user' object has an '_id' field
      await axios.post("http://localhost:3001/update-name", { userId, name });
      fetchUserData();
          window.alert('Name changed successfully!');

    } catch (error) {
      console.error('Error updating the name:', error);
    }
  };
  

  const handleSubmitProfilePhoto = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('username', user?.username);
    formData.append('profileimage', selectedFile);

    try {
      await axios.post("http://localhost:3001/upload-user-pfp", formData);
      fetchUserData(); // Refetch user data after successful upload
    } catch (error) {
      console.error('Error during the file upload:', error);
    }
  };
  return (
    <div className='asaccountsettings'>
     <h1 className='asmainhead1'>Personal Information</h1>
      {/* <div>
        <label htmlFor='username'>Username <span>*</span></label>
        <input type='text' id='username' value={username} onChange={handleUsernameChange} />
        <button onClick={handleSubmitUsername} className='mainbutton1'>Change Username</button>
  </div>*/}
      <div>
        <label htmlFor='name'>Name <span>*</span></label>
        <input type='text' id='name' value={name} onChange={handleNameChange} />
        <button onClick={handleSubmitName} className='acmainbutton1'>Change Name</button>
      </div>
      <div>
        <label htmlFor='profilePhoto'>Profile Photo <span>*</span></label>
        <input type='file' id='profilePhoto' name='profileimage' onChange={handleFileChange} />
        <button onClick={handleSubmitProfilePhoto} className='acmainbutton1'>Change Profile Photo</button>
      </div>
    </div>
  );
};

AccountSettings.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    name: PropTypes.string,
  }),
  fetchUserData: PropTypes.func.isRequired,
};

export default AccountSettings;
