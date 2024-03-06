import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiTwotoneDelete } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";

const Customer = () => {
  const [userdata, setUserdata] = useState();
  const [premuser, setPremUser] = useState([]);
  const [user, setUser] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [userDetail, setUserDetail] = useState();
  const fetchusers = async () => {
    const userColl = "users";
    try {
      axios.post("http://localhost:3001/get-dbuser", userColl).then((res) => {
        const databook = res.data.data; //data.data??
        // alert(res.data.message);
        setUserdata(databook);
        // setBkByAdmin(databook.length);
        setPremUser(databook.filter((user) => user.isPremium)); // filter for premium users
        setUser(databook.filter((user) => !user.isPremium)); // filter for non-premium users});
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
  const premuserCount = premuser.length;
  const userCount = user.length;

  const deluser = (us) => {
    console.log(us?.email);
    axios
      .post("http://localhost:3001/deluser", { email: us?.email })
      .then((res) => {
        alert(res.data.message);
        if (res.data.status == "del") {
          fetchusers();
          // return (window.location.href = "/admin/books");
        }
      });
  };
  return (
    <div className="main-book relative overflow-hidden flex flex-col">
      <div className="bcards h-auto">
        <div className="bkcard">
          <h2>NORMAL USER</h2>
          <h3>{userCount}</h3>
        </div>
        <div className="bkcard">
          <h2>PREMIUM USER</h2>
          <h3>{premuserCount}</h3>
        </div>
      </div>
      <h1 className="tbhead text-3xl -mb-10">User Table</h1>
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
                <th>Manage</th>
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
                    <td>{i.name}</td>
                    <td>{i.username}</td>
                    <td>{i.role}</td>
                    <td>{i.isPremium ? "True" : "False"}</td>
                    <td>{i.gender}</td>
                    <td>{i.dob}</td>
                    <td className="cemail">{i.email}</td>
                    <td>{i.password}</td>
                    {/* <td className="tbcon">{i.bkcon}</td> */}
                    <td>
                      <div className=" w-full h-auto p-8 flex  justify-center gap-5 text-white">
                        <FaRegEdit
                          size={30}
                          onClick={() => {
                            setUserDetail(i);
                            setEditOpen(!editOpen);
                          }}
                          className="active:scale-90 cursor-pointer ease-in-out duration-200"
                        />
                        <AiTwotoneDelete
                          size={30}
                          onClick={() => {
                            // setBkDetail(i);
                            deluser(i);
                          }}
                          className="active:scale-90 cursor-pointer ease-in-out duration-200"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div
        className={`${editOpen ? "opacity-100" : "opacity-0 hidden"
          } absolute mt-20 w-full h-full backdrop-blur-sm flex justify-center z-50`}
      >
        <UserDetail
          setEditOpen={setEditOpen}
          userDetail={userDetail}
          fetchusers={fetchusers}
        />
      </div>
    </div>
  );
};
export default Customer;
export const UserDetail = (props) => {
  const { setEditOpen, userDetail, fetchusers } = props;
  const [user, setUser] = useState({
    name: "",
    username: "",
    role: "",
    isPremium: "",
    gender: "",
    dob: "",
    email: "",
    password: "",
  });
  //dropdown list
  // const options = [
  //   "Adventure",
  //   "Children's literature",
  //   "Fiction",
  //   "Historical Fiction",
  //   "Horror",
  //   "Humor",
  //   "Mythology",
  //   "Nonfiction",
  //   "Poetry",
  //   "Paranormal",
  //   "Romance",
  //   "Self Help",
  //   "Thriller",
  // ];
  // const [selectedOption, setSelectedOption] = useState("");
  // const handleSelectChange = (event) => {
  //   setSelectedOption(event.target.value);
  // };
  // const [bkCon, setBkCon] = useState(null);
  // const [bkImagePath, setBkImagePath] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };
  const edituser = (e) => {
    e.preventDefault();

    // const data = new FormData();
    // data.set("email", userDetail?.email);
    // data.set("password", user?.password);
    // data.set("name", userDetail?.name);
    // data.set("username", user?.username);
    // data.set("role", user?.role);
    // data.set("isPremium", user?.isPremium);
    // data.set("gender", user?.gender);
    // data.set("dob", user?.dob);

    // data.set("bkCon", bkCon);

    axios.post("http://localhost:3001/edit-user", {
      email: userDetail?.email,
      username: userDetail?.username,
      isPremium: userDetail?.isPremium,
      password: user?.password,
      name: user.name,
      role: user.role,
      gender: user.gender,
      dob: user.dob,
    }).then((res) => {
      alert(res.data.message);
      if (res.data.status == "ok") {
        fetchusers();
        setUser({
          name: "",
          username: "",
          role: "",
          isPremium: "",
          gender: "",
          dob: "",
          email: "",
          password: "",
        });
        setEditOpen(false);
      }
    });
  };
  return (
    <>
      <form className="relative w-[50%] h-[40rem] shadow-2xl rounded-xl flex flex-col gap-2 items-center justify-center border">
        <div
          onClick={() => setEditOpen(false)}
          className="absolute cursor-pointer w-auto h-auto text-2xl right-2 top-2 active:scale-90 ease-in-out duration-200"
        >
          X
        </div>
        <span className="text-4xl mb-2">Edit user details</span>
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
          placeholder={userDetail?.name ?? "user-name"}
        />
        <input
          type="text"
          name="username"
          value={user.username}
          onChange={handleChange}
          disabled
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg placeholder:text-black text-black p-2"
          placeholder={userDetail?.username ?? "user-username"}
        />
        <input
          type="text"
          name="role"
          value={user.role}
          onChange={handleChange}
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
          placeholder={userDetail?.role ?? "book-role"}
        />

        <input
          type="text"
          // name="isPremium"
          // value={book.isPremium}
          // onChange={handleChange}
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg placeholder:text-black text-black p-2"
          disabled
          placeholder={`Premium subsription : ${userDetail?.isPremium ? "True" : "False" ?? "book-isPremium"}
          `}
        />

        <input
          type="text"
          name="gender"
          value={user.gender}
          onChange={handleChange}
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
          placeholder={userDetail?.gender ?? "user-gender"}
        />
        <input
          type="text"
          name="dob"
          value={user.dob}
          onChange={handleChange}
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
          placeholder={userDetail?.dob ?? "user-dob"}
        />
        <input
          type="text"
          // name="email"
          // value={user.email}
          // onChange={handleChange}
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg placeholder:text-black text-black p-2"
          disabled
          placeholder={userDetail?.email ?? "user-email"}
        />
        <input
          type="text"
          name="password"
          value={user.password}
          onChange={handleChange}
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
          placeholder={userDetail?.password ?? "user-password"}
        />
        <button
          type="submit"
          onClick={edituser}
          className="w-[20%] h-[3rem] bg-primary mt-2 rounded-md hover:scale-110 active:scale-90 ease-in-out duration-200"
        >
          Update
        </button>
      </form>
    </>
  );
};
