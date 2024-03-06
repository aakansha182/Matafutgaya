import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
const AuthorProfile = () => {
  const { authName } = useParams();
  // console.log(decodeURIComponent(authName));

  const [userDetail, setUserDetail] = useState();
  const [bookDetail, setBookDetail] = useState([]);
  const fetchusers = async () => {
    try {
      axios
        .post("http://localhost:3001/get-user", {
          username: decodeURIComponent(authName),
        })
        .then((res) => {
          if (res.data.status == "ok") {
            const usDetail = res.data.user;
            // console.log(res.data.message, "\n", usDetail);
            return setUserDetail(usDetail);
          }
          alert(res.data.message);
        });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!userDetail) {
      // console.log(userDetail);
      fetchusers();
    }
  });

  const fetchbooks = async () => {
    const bookColl = "books";
    try {
      axios
        .post("http://localhost:3001/get-dbcollections", { bookColl })
        .then(async (res) => {
          // console.log(res.data.data);
          const bkDetail = res.data.data.filter(
            (book) => book.authName === decodeURIComponent(authName)
          );
          // console.log(bkDetail);
          setBookDetail(bkDetail);
        });
    } catch (error) {
      console.log(error);
    }
  };
  console.log(bookDetail);
  useEffect(() => {
    // if (!bookDetail) {
    fetchbooks();
  });
  // console.log(userDetail?.profileimage);
  return (
    <div className="flex flex-col w-full h-full  gap-10 items-center">
      <div className="w-[98%] h-[17rem] border-solid border-2 border-white rounded-lg flex flex-col items-center justify-center gap-5">
        <div className="w-[10rem] h-[10rem] rounded-full bg-black text-primary flex items-center justify-center">
          <img
            src={
              userDetail?.profileimage ??
              "/assests/booksanime-ezgif.com-crop.gif"
            }
            alt="author pfp"
            className="w-full rounded-full h-[100%]"
          />
        </div>
        <div className="text-white text-base font-bold">
          Author Name : {userDetail?.username}
        </div>
      </div>
      <div className="w-[98%] h-[100%] border-solid border-2 border-white rounded-lg grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center  ">
        {bookDetail.map((book) => (
          <div key={book.bkName} className="div space-y-3">
            <BooksCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorProfile;

export const BooksCard = ({ book }) => {
  return (
    <>
      <div className=" div  w-auto h-auto flex flex-col gap-5 shadow-xl text-black scale-90 hover:scale-95 hover:bg-orange-500 ease-in-out duration-300 rounded-xl active:scale-90 overflow-hidden">
        <Link to={`/admin/books/book-detail/${book.bkName}`} target="_parent">
          <img
            src={book.bkImagePath}
            alt=""
            className="h-[220px] w-[150px] object-cover rounded-md"
          />
        </Link>
        <div>
          <h3 className="font-semibold dark:text-white">{book.bkName}</h3>
          <p className="text-sm text-stone-700">{book.authName}</p>
        </div>
      </div>
    </>
  );
};
