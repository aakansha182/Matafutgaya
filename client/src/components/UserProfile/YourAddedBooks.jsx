import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../loading";
import { Link } from "react-router-dom";

const YourAddedBooks = () => {
  const uData = JSON.parse(window.localStorage.getItem("user"));
  const [bookDetail, setBookDetail] = useState();

  const fetchbooks = async () => {
    const bookColl = "books";
    try {
      const res = await axios.post(
        "http://localhost:3001/get-dbcollections",
        bookColl
      );
      const databook = res.data.data;
      setBookDetail(
        databook.filter((book) => book.authName === uData.username)
      );
      // setBookDetail(bkDetail);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!bookDetail) {
      fetchbooks();
    }
  }, [bookDetail]);

  return (
    <div className="w-full h-auto bg-gray-200 dark:bg-neutral-900 dark:text-white duration-200  relative">
      {!bookDetail ? (
        <div className="w-full h-screen text-center text-3xl p-4">
          Loading...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-5 ">
            {bookDetail.map((book) => (
              <div key={book.bkName} className="div space-y-3">
                <BooksCard book={book} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default YourAddedBooks;

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
