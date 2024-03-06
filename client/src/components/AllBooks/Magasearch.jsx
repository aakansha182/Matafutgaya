import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../loading";
import { Link } from "react-router-dom";
import "./AllBooks.css";
const Audiobk = () => {
  const [bookdata, setBookdata] = useState([]);
  const [bknameInput, setBknameInput] = useState("");
  const [selectedOption, setSelectedOption] = useState("All");
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

  const fetchbooks = async () => {
    const bookColl = "maga";

    try {
      const res = await axios.post("http://localhost:3001/get-mag", bookColl);
      const databook = res.data.data;

      let filteredBooks = databook;

      if (selectedOption !== "All") {
        filteredBooks = databook.filter(
          (book) => book.magGenre === selectedOption
        );
      }
      if (bknameInput !== "") {
        filteredBooks = filteredBooks.filter(
          (book) => book.magName === bknameInput
        );
      }
      setBookdata(filteredBooks);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchbooks();
  }, [bknameInput, selectedOption]);

  return (
    <div className="all-books-container">
      <div className="search-container">
        <h2 className="search-header">Find your dream Magazine !</h2>
        <div className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Type the book"
            value={bknameInput}
            onChange={(e) => setBknameInput(e.target.value)}
          />
          <select
            className="genre-select"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button className="search-button" onClick={fetchbooks}>
            Search
          </button>
        </div>
      </div>
      {bookdata.length === 0 ? (
        <Loading />
      ) : (
        <div className="books-grid">
          {bookdata.map((book) => (
            <BooksCard key={book?.magName} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Audiobk;

export const BooksCard = ({ book }) => {
  return (
    <div className="book-card">
      <Link to={`/admin/books/magazines-detail/${book?.magName ?? "name"}`}>
        <img
          src={book?.magImage ?? "default-img.jpg"}
          alt={book?.magName ?? "Book Cover"}
          className="book-cover"
        />
      </Link>
      <div className="book-info">
        <h3>{book?.magName ?? "Book Name"}</h3>
        <p>{book?.magAuthName ?? "Author Name"}</p>
      </div>
    </div>
  );
};
