import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../loading";
import { Link } from "react-router-dom";

const Books = () => {
  const [latestBooks, setLatestBooks] = useState([]);

  useEffect(() => {
    const fetchLatestBooks = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3001/get-latest-books"
        );
        setLatestBooks(response.data.data);
      } catch (error) {
        console.error("Error fetching latest books:", error);
      }
    };

    fetchLatestBooks();
  }, []);

  return (
    <div className="container">
      <div className="text-center mb-10 max-w-[600px] mx-auto">
        <h1 className="text-3xl font-bold">Latest Books</h1>
      </div>
      {latestBooks.length === 0 && <Loading />}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-5 ">
        {latestBooks.map((book) => (
          <div key={book._id} className="div space-y-3">
            <BooksCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;

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
