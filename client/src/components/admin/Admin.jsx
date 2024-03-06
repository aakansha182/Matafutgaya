import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsFillBellFill,
} from "react-icons/bs";

function Admin() {
  //get data
  const [bookdata, setBookdata] = useState();
  const books = "books";
  const fetchbooks = async () => {
    const bookColl = books;

    try {
      axios
        .post("http://localhost:3001/get-dbcollections", bookColl)
        .then((res) => {
          const databook = res.data.data;
          setBookdata(databook.length);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!bookdata) {
      fetchbooks();
    }
  }, []);
  console.log(bookdata);
  //audio-data
  const [audiobookdata, setAudioBookdata] = useState();
  const fetchabooks = async () => {
    const bookColl = "audiobooks";

    try {
      axios.post("http://localhost:3001/get-audiobk", bookColl).then((res) => {
        const databook = res.data.data;
        // alert(res.data.message);
        setAudioBookdata(databook.length);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!audiobookdata) {
      fetchabooks();
    }
  }, []);
  console.log(audiobookdata);
  //user-data
  const [udata, setUdata] = useState();
  const fetchusers = async () => {
    const userColl = "users";

    try {
      axios.post("http://localhost:3001/get-dbuser", userColl).then((res) => {
        const datauser = res.data.data;
        // alert(res.data.message);
        // setUserdata(datauser);
        setUdata(datauser.length);
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!userdata) {
      fetchusers();
    }
  }, []);
  //magazine data
  const [magadata, setMagadata] = useState();
  const fetchmagazines = async () => {
    const magazineColl = "magazines";
    try {
      axios.post("http://localhost:3001/get-mag", magazineColl).then((res) => {
        const databook = res.data.data; //data.data??

        setMagadata(databook.length);
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!magadata) {
      fetchmagazines();
    }
  }, []);
  //latest-user
  const [userdata, setUserdata] = useState();
  const fetchlatestuser = async () => {
    const userColl = "users";
    try {
      axios
        .post("http://localhost:3001/get-latest-users", userColl)
        .then((res) => {
          const databook = res.data.data; //data.data??

          setUserdata(databook);
        });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!userdata) {
      fetchlatestuser();
    }
  }, []);
  console.log(userdata);
  return (
    <main className="main-container">
      <div className="main-title">
        <h3>DASHBOARD</h3>
      </div>

      <div className="main-cards">
        <a href="/admin/books">
          <div className="card">
            <div className="card-inner">
              <h3>Books</h3>
              <BsFillArchiveFill className="card_icon" />
            </div>
            <h1>{bookdata}</h1>
          </div>
        </a>
        <a href="/admin/audiobooks">
          <div className="carda">
            <div className="card-inner">
              <h3>Audiobooks</h3>
              <BsFillBellFill className="card_icon" />
            </div>
            <h1>{audiobookdata}</h1>
          </div>
        </a>
        <a href="/admin/customer">
          <div className="cardu">
            <div className="card-inner">
              <h3>Users</h3>
              <BsPeopleFill className="card_icon" />
            </div>
            <h1>{udata}</h1>
          </div>
        </a>
        <a href="/admin/genre">
          <div className="cardg">
            <div className="card-inner">
              <h3>Magazine</h3>
              <BsFillGrid3X3GapFill className="card_icon" />
            </div>
            <h1>{magadata}</h1>
          </div>
        </a>
      </div>
      <div className="main-title">
        <h3>LATEST USER</h3>
      </div>
      <div className="scrollDi">
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Premium</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>Email ID</th>
                <th>Password</th>
                {/* <th>Manage</th> */}
              </tr>
            </thead>
            <tbody>
              {userdata == undefined && <span>undefined</span>}
              {userdata != undefined &&
                //  do both the line above will work
                userdata.map((i) => (
                  <tr key={i.email}>
                    {/* <BooksCard i={i} /> */}
                    {/* what i is doing?? */}
                    <td className="cname">{i.name}</td>
                    <td className="cname">{i.username}</td>
                    <td>{i.role}</td>
                    <td>{i.isPremium ? "True" : "False"}</td>
                    <td>{i.gender}</td>
                    <td>{i.dob}</td>
                    <td className="cemail">{i.email}</td>
                    <td>{i.password}</td>
                    {/* <td className="tbcon">{i.bkcon}</td> */}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default Admin;
