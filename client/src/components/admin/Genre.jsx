import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiTwotoneDelete } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import "../../cStyles/admin.css";

const Genre = () => {
  const [magadata, setMagadata] = useState();
  const [editOpen, setEditOpen] = useState(false);
  const [bkDetail, setBkDetail] = useState();
  const fetchmagazines = async () => {
    const magazineColl = "magazines";
    try {
      axios.post("http://localhost:3001/get-mag", magazineColl).then((res) => {
        const databook = res.data.data; //data.data??

        setMagadata(databook);
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
  const delmagazine = (mg) => {
    console.log(mg?.magName);
    axios
      .post("http://localhost:3001/delmagazine", { magName: mg?.magName })
      .then((res) => {
        alert(res.data.message);
        if (res.data.status == "del") {
          fetchmagazines();
          // return (window.location.href = "/admin/books");
        }
      });
  };
  return (
    <div className="main-book relative overflow-hidden flex flex-col">
      <h1 className="tbhead text-3xl -mb-10">Magazine Table</h1>
      <div className="scrollDi">
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>By</th>
                <th>Magazine Cover</th>
                <th>Magazine Description</th>
                <th>Magazine Content</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {magadata == undefined && <span>undefined</span>}
              {magadata != undefined &&
                //  do both the line above will work
                magadata.map((i) => (
                  <tr key={i._id}>
                    {/* <BooksCard i={i} /> */}
                    {/* what i is doing?? */}
                    <td>{i.magName}</td>
                    <td>{i.magAuthName}</td>
                    <td>{i.magGenre}</td>
                    <td>{i.role}</td>
                    <td className="Mtbim">{i.magImage}</td>
                    <td className="Mtbcon">{i.magDesp}</td>
                    <td className="Mtbcon">{i.magCon}</td>
                    <td>
                      <div className=" w-full h-auto p-8 flex flex-col justify-center gap-5 text-white">
                        <FaRegEdit
                          size={30}
                          onClick={() => {
                            setBkDetail(i);
                            setEditOpen(!editOpen);
                          }}
                          className="active:scale-90 cursor-pointer ease-in-out duration-200"
                        />
                        <AiTwotoneDelete
                          size={30}
                          onClick={() => {
                            // setBkDetail(i);
                            delmagazine(i);
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
        <MagazineDetail
          setEditOpen={setEditOpen}
          magazineDetail={bkDetail}
          fetchmagazines={fetchmagazines}
        />
      </div>
    </div>
  );
};

export default Genre;

export const MagazineDetail = (props) => {
  const { setEditOpen, magazineDetail, fetchmagazines } = props;
  const [magazine, setMagazine] = useState({
    magName: "",
    magAuthName: "",
    magGenre: "",
    magDesp: "",
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
  const [magImage, setmagImage] = useState(null);
  const [magCon, setmagCon] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMagazine({
      ...magazine,
      [name]: value,
    });
  };

  // console.log(book);
  const editmagazine = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.set("magName", magazineDetail?.magName);
    data.set("magAuthName", magazine.magAuthName);
    data.set("magImage", magImage);
    data.set("magGenre", magazine.magGenre);
    data.set("magDesp", magazine.magDesp);
    data.set("magCon", magCon);

    axios.post("http://localhost:3001/edit-magazine", data).then((res) => {
      alert(res.data.message);
      if (res.data.status == "ok") {
        fetchmagazines();
        setMagazine({
          magName: "",
          magAuthName: "",
          magGenre: "",
          magDesp: "",
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
        <span className="text-4xl mb-2">Edit Magazine details</span>
        <input
          type="text"
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg placeholder:text-black text-black p-2"
          disabled
          placeholder={magazineDetail?.magName ?? "book-name"}
        />
        <input
          type="text"
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
          // disabled
          name="magAuthName"
          value={magazine.magAuthName}
          onChange={handleChange}
          placeholder={magazineDetail?.magAuthName ?? "magazine-author"}
        />
        <select
          id="dropdown"
          name="magGenre"
          value={magazine.magGenre}
          onChange={handleChange}
          className="w-[80%] h-[3rem] border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
        >
          <option value="" disabled>
            {magazineDetail?.magGenre ?? "magazine-genre"}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>

        <textarea
          rows={5}
          name="magDesp"
          value={magazine.magDesp}
          onChange={handleChange}
          className="w-[80%] h-auto border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
          placeholder={magazineDetail?.magDesp ?? "magazine-description"}
        ></textarea>
        <div className="w-[80%] h-[3rem] flex gap-2 border shadow-xl rounded-lg text-black p-2 bg-[#FAEBD7]">
          <span className="w-[50%]">Update Cover Image : </span>
          <input
            type="file"
            name="magImage"
            accept=".jpg, .jpeg, .png"
            required
            placeholder="Add your magazines cover"
            onChange={(e) => setmagImage(e.target.files[0])}
            className="w-full h-full"
          ></input>
        </div>
        <div className="w-[80%] h-[3rem] flex gap-2 border shadow-xl rounded-lg text-black p-2 bg-[#FAEBD7]">
          <span className="w-[50%]">Update Content : </span>
          <input
            type="file"
            name="magCon"
            accept=".pdf"
            required
            placeholder="Add your magazines pdf"
            onChange={(e) => setmagCon(e.target.files[0])}
            className="w-full h-full"
          ></input>
        </div>
        <button
          type="submit"
          onClick={editmagazine}
          className="w-[20%] h-[3rem] bg-primary mt-2 rounded-md hover:scale-110 active:scale-90 ease-in-out duration-200"
        >
          Update
        </button>
      </form>
    </>
  );
};
