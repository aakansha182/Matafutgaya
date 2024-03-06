// import React from 'react'

// const Addgenre = () => {
//   return (
//     <main className='main-gen'>
//     <div className='ingen'>
//      <div className='headgen'>
//         <img
//               src="/assests/logoExplore.png"
//               alt="Logo Image"/>
//               <span className='gline'><h2>Add new Genre</h2></span>
//       </div>
//       <form className='gen-form'>
//              <div className="genbk">
//                <label htmlFor="bkgenre">Book Genre</label>
//                <div className="input-flexgen">
//                  <input
//                      type="text"
//                      name="bkgenre"
//                      required
//                     placeholder="Books Category"
//                  ></input>

//                </div>
//              </div>
//              <button type='submit' className='genbtn'>
//                     <span>Add</span>
//                      </button>
//       </form>
//      </div>
//   </main>
//   )
// }

// export default Addgenre
import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../../cStyles/admin.css";

const Addaudiobook = () => {
  const navigate = useNavigate();
  const [magCon, setMagCon] = useState(null);
  const [magImage, setMagImage] = useState(null);
  const [magazine, setMagazine] = useState({
    magName: "",
    magAuthName: "",
    role: "admin",
    // magImage: "",
    magGenre: "",
    magDesp: "",
    // magCon: "",
  });
  //dropdown list
  const options = [
    "Fashion and Beauty",
    "Lifestyle",
    "Entertainment",
    "Travel",
    "Food and Cooking",
    "Technology",
    "Science and Nature",
    "Business and Finance",
    "Hobby and Special Interest",
    "Sports",
    "Literary and Arts",
  ];
  // const [selectedOption, setSelectedOption] = useState("");
  // const handleSelectChange = (event) => {
  //   setSelectedOption(event.target.value);
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMagazine({
      ...magazine,
      [name]: value,
    });
  };

  // console.log(audiobook, audioBkCon, audioBkImage);

  const addmagazine = (e) => {
    e.preventDefault();

    const data = new FormData();

    if (
      magazine.magName &&
      magazine.magAuthName &&
      magazine.role &&
      // magazine.magImage &&
      // audioBkImage &&
      magazine.magGenre &&
      magazine.magDesp
      // amagazine.magCon
      // bkCon
    ) {
      data.set("magName", magazine.magName);
      data.set("magAuthName", magazine.magAuthName);
      data.set("role", magazine.role);
      data.set("magImage", magImage);
      data.set("magGenre", magazine.magGenre);
      data.set("magDesp", magazine.magDesp);
      data.set("magCon", magCon);

      axios.post("http://localhost:3001/addmagzine", data).then((res) => {
        alert(res.data.message);
        navigate("/admin/genre");
      });
    } else {
      alert("Invalid input");
    }
  };

  return (
    <main className="main-abk">
      <div className="inbk">
        <div className="headbk">
          <img src="/assests/logoExplore.png" alt="Logo Image" />
          <span className="line">
            <h2>Upload a Magazine</h2>
          </span>
        </div>
        <form
          className="input-form"
          onSubmit={addmagazine}
          encType="multipart/form-data"
        >
          <div className="outbk">
            <div className="innerbk">
              <div className="inputbk">
                <label htmlFor="audioBkName">Magazine Title</label>
                <div className="input-flexbk">
                  <input
                    type="text"
                    name="magName"
                    value={magazine.magName}
                    required
                    placeholder="Enter Magazine name"
                    onChange={handleChange}
                  ></input>
                </div>
              </div>
              <div className="inputbk">
                <label htmlFor="authname">Author Name</label>
                <div className="input-flexbk">
                  <input
                    type="text"
                    name="magAuthName"
                    value={magazine.magAuthName}
                    required
                    placeholder="Author name"
                    onChange={handleChange}
                  ></input>
                </div>
              </div>
            </div>
            <div className="innerbk">
              <div className="inputbk">
                <label htmlFor="bkimage">Magazine Cover </label>
                <div className="input-flexbk">
                  <input
                    type="file"
                    name="magImage"
                    accept=".jpg, .jpeg, .png"
                    required
                    placeholder="Magazine Image Url"
                    onChange={(e) => setMagImage(e.target.files[0])}
                  ></input>
                </div>
              </div>
              <div className="inputbk">
                <label htmlFor="audioBkCon">Magazine Content</label>
                <div className="input-flexbk">
                  <input
                    type="file"
                    name="magCon"
                    accept="pdf"
                    required
                    placeholder=" Add your Magazine"
                    onChange={(e) => setMagCon(e.target.files[0])}
                  ></input>
                </div>
              </div>
            </div>
            <div className="innerbk">
              <div className="innm">
                <div className="inputbk">
                  <label htmlFor="bkaudioDesp">Magazine Description</label>
                  <div className="input-flexbk">
                    <textarea
                      name="magDesp"
                      id="myTextarea"
                      value={magazine.magDesp}
                      rows={2} // Set the number of visible rows
                      cols={47} // Set the number of visible columns
                      placeholder="Write audiobooks Description" // Placeholder text
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
                <div className="inputbk">
                  <label htmlFor="bkgenre">Magazine Genre</label>
                  <div className="dp-flexbk">
                    <select
                      id="dropdown"
                      name="magGenre"
                      value={magazine.magGenre}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="adbtn">
            <span>Add</span>
          </button>
        </form>
      </div>
    </main>
  );
};

export default Addaudiobook;
