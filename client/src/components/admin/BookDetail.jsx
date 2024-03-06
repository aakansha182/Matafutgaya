import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AiTwotoneDelete, AiFillHeart } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { GiBlackBook } from "react-icons/gi";
import BookView from "../BookView";
import "./BookDetails.css";
const BookDetail = () => {
  const { bkname } = useParams(); 
  // console.log(decodeURIComponent(bkname));
  const uData = JSON.parse(window.localStorage.getItem("user"));
  // console.log(uData);
  const isPremium = uData?.isPremium;

  const [bookDetail, setBookDetail] = useState();
  const [commentOpen, setCommentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [averageRating, setAverageRating] = useState(0); // Add state to store average rating
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);


  useEffect(() => {
    if (!bookDetail) {
      fetchbooks();
    } else {
      fetchComments(); // Fetch comments once bookDetail is available
      calculateAverageRating(); // Calculate the average rating when bookDetail is available
    }
  }, [bookDetail]);

  const [book, setBook] = useState({
    bkName: "",
    authName: "",
    bkGenre: "",
    bkDesp: "",
  });
  const options = [
    "Adventure",
    "Children's literature",
    "Fiction",
    "Historical Fiction",
    "Horror",
    "Humor",
    "Mythology",
    "Nonfiction",
    "Poetry",
    "Paranormal",
    "Romance",
    "Self Help",
    "Thriller",
  ];
  // const [bkCon, setBkCon] = useState(null);
  const [bkImagePath, setBkImagePath] = useState(null);

  const fetchbooks = async () => {
    const bookColl = "books";
    try {
      axios
        .post("http://localhost:3001/get-dbcollections", { bookColl })
        .then(async (res) => {
          const bkDetail = res.data.data.filter(
            (book) => book.bkName === decodeURIComponent(bkname)
          )[0];
          setBookDetail(bkDetail);

          try {
            const favoriteResponse = await axios.post(
              "http://localhost:3001/is-favorited",
              {
                userId: uData._id,
                bookId: bkDetail._id,
              }
            );
            setIsFavorited(favoriteResponse.data.isFavorited); // Assuming the backend returns { isFavorited: true/false }
          } catch (error) {
            console.error("Error checking favorite status", error);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(bookDetail);
  useEffect(() => {
    if (!bookDetail) {
      fetchbooks();
    }
  });

  //favoraite book
  const addToFavorites = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/add-to-favorites",
        {
          userId: uData._id,
          bookId: bookDetail._id,
        }
      );
      console.log(response.data);
      setIsFavorited(true); // Set isFavorited to true
    } catch (error) {
      console.error("Error adding book to favorites", error);
    }
  };

  const removeFromFavorites = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/remove-from-favorites",
        {
          userId: uData._id,
          bookId: bookDetail._id,
        }
      );
      console.log(response.data);
      setIsFavorited(false); // Set isFavorited to false
    } catch (error) {
      console.error("Error removing book from favorites", error);
    }
  };

  // Call fetchComments within useEffect where you fetch book details
  const submitComment = async () => {
    if (isPremium) {
      try {
        await axios.post("http://localhost:3001/submit-comment", {
          bkName: bookDetail.bkName,
          profileimage: uData.profileimage,
          username: uData.username,
          comment: newComment,
        });
        setNewComment(""); // Reset the input field after submission
        window.alert("Your comment sumbitted successfully!");

        // Optionally, fetch the updated comments list here
      } catch (error) {
        console.error("Error submitting comment", error);
      }
    } else {
      alert("Only premium users can submit comments.");
    }
  };

  // console.log(bookDetail?.chapters);
  const calculateAverageRating = () => {
    if (bookDetail && bookDetail.ratings && bookDetail.ratings.length > 0) {
      const sum = bookDetail.ratings.reduce(
        (accumulator, current) => accumulator + current.rating,
        0
      );
      const avg = sum / bookDetail.ratings.length;
      setAverageRating(avg.toFixed(1)); // Set the average rating, round to 1 decimal place
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({
      ...book,
      [name]: value,
    });
  };

  const editbook = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.set("bkName", bookDetail?.bkName);
    data.set("authName", bookDetail?.authName);
    data.set("bkImagePath", bkImagePath);
    data.set("bkGenre", book.bkGenre);
    data.set("bkDesp", book.bkDesp);
    // data.set("bkCon", bkCon);

    axios.post("http://localhost:3001/edit-book", data).then((res) => {
      alert(res.data.message);
      if (res.data.status == "ok") {
        fetchbooks();
        setBook({
          bkName: "",
          authName: "",
          bkGenre: "",
          bkDesp: "",
        });
        setEditOpen(!editOpen);
      }
    });
  };
  const delbook = () => {
    axios
      .post("http://localhost:3001/delbook", { bkName: bookDetail?.bkName })
      .then((res) => {
        alert(res.data.message);
        if (res.data.status == "del") {
          return (window.location.href = "/admin/books");
        }
      });
  };
  const StarRating = ({ rating, onRating }) => {
    return (
      <div className="rating-section">
        <div className="star-rating">
          {[...Array(5)].map((star, index) => {
            index += 1;
            return (
              <button
                key={index}
                className={
                  index <= userRating ? "text-orange-500" : "text-gray-400"
                }
                onClick={() => onRating(index)}
                style={{
                  fontSize: "24px",
                }} /* Adjust size directly if preferred */
              >
                ★
              </button>
            );
          })}
        </div>
        <div className="your-rating-text">Your Rating</div>
      </div>
    );
  };

  const [userRating, setUserRating] = useState(0);

  // Mock function to handle rating submission - replace with your actual API call
  const submitRating = (newRating) => {
    axios
      .post("http://localhost:3001/submit-rating", {
        bkName: bookDetail.bkName,
        userId: uData._id, // Assuming you store user ID in local storage or context
        username: uData.username,
        rating: newRating,
      })
      .then((response) => {
        console.log(response.data);
        setUserRating(newRating); // Update the local user rating state
        // Optionally, refresh the book detail to fetch updated ratings
      })
      .catch((error) => console.error("Error submitting rating", error));
  };

  useEffect(() => {
    // Assuming bookDetail contains rating information
    // Ensure bookDetail and bookDetail.ratings are defined before accessing them
    if (bookDetail && bookDetail.ratings) {
      const currentRating = bookDetail.ratings.find(
        (rating) => rating.userId === uData._id
      )?.rating;
      if (currentRating) {
        setUserRating(currentRating);
      }
    }
  }, [bookDetail]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/comments/${encodeURIComponent(bkname)}`
      );
      // console.log(response.data); // Check the response
      setComments(response.data || []); // Adjust according to your actual response structure
      fetchbooks();
    } catch (error) {
      console.log("Error fetching comments:", error);
      setComments([]); // Fallback to an empty array in case of error
    }
  };
  // console.log(comments);

  return (
    <>
      <div className="w-full h-auto bg-gray-200 dark:bg-neutral-900 dark:text-white duration-200  relative">
        {!bookDetail ? (
          <div className="w-full h-screen text-center text-3xl p-4">
            Loading...
          </div>
        ) : (
          <>
            {uData.username == bookDetail?.authName && (
              <>
                <div className="absolute w-full h-auto p-8 flex justify-end gap-5 text-white">
                  <Link
                    to={`http://localhost:5173/test-chp/${bookDetail?.bkName}`}
                    className="flex"
                  >
                    <GiBlackBook
                      size={30}
                      // onClick={() => setEditOpen(!editOpen)}
                      className="active:scale-90 cursor-pointer ease-in-out duration-200"
                    />{" "}
                    <span className="text-2xl">+</span>
                  </Link>
                  <FaRegEdit
                    size={30}
                    onClick={() => setEditOpen(!editOpen)}
                    className="active:scale-90 cursor-pointer ease-in-out duration-200"
                  />
                  <AiTwotoneDelete
                    size={30}
                    onClick={delbook}
                    className="active:scale-90 cursor-pointer ease-in-out duration-200"
                  />
                </div>
              </>
            )}
            <div
              className={`${editOpen ? "opacity-100" : "opacity-0 hidden"
                } absolute mt-20 w-full h-full backdrop-blur-sm flex justify-center z-50`}
            >
              <form className=" relative w-[50%] h-[40rem] shadow-2xl rounded-xl flex flex-col gap-2 items-center justify-center border">
                <div
                  onClick={() => setEditOpen(false)}
                  className="absolute cursor-pointer w-auto h-auto text-2xl right-2 top-2 active:scale-90 ease-in-out duration-200"
                >
                  X
                </div>
                <span className="text-4xl text-black mb-2">
                  Edit book details
                </span>
                <input
                  type="text"
                  className="w-[80%] h-[3rem] border shadow-xl rounded-lg  placeholder:text-black text-black p-2"
                  disabled
                  placeholder={bookDetail?.bkName ?? "book-name"}
                />
                <input
                  type="text"
                  className="w-[80%] h-[3rem] border shadow-xl rounded-lg  placeholder:text-black text-black p-2"
                  disabled
                  placeholder={bookDetail?.authName ?? "book-author"}
                />
                <select
                  id="dropdown"
                  name="bkGenre"
                  value={book.bkGenre}
                  onChange={handleChange}
                  className="w-[80%] h-[3rem] border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
                >
                  <option value="" disabled>
                    {bookDetail?.bkGenre ?? "book-genre"}
                  </option>
                  {options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <textarea
                  rows={5}
                  name="bkDesp"
                  value={book.bkDesp}
                  onChange={handleChange}
                  className="w-[80%] h-auto border shadow-xl rounded-lg bg-[#FAEBD7] placeholder:text-black text-black p-2 outline-none focus:scale-105"
                  placeholder={bookDetail?.bkDesp ?? "book-description"}
                ></textarea>
                <div className="w-[80%] h-[3rem] flex gap-2 border shadow-xl rounded-lg text-black p-2 bg-[#FAEBD7]">
                  <span className="w-[35%]">Update Cover Image : </span>
                  <input
                    type="file"
                    name="bkImagePath"
                    // value={bkCon}
                    accept=".jpg, .jpeg, .png"
                    required
                    placeholder={bookDetail?.bkImagePath ?? "bookcover"}
                    onChange={(e) => setBkImagePath(e.target.files[0])}
                    className="w-full h-full"
                  ></input>
                </div>
                {/* <div className="w-[80%] h-[3rem] flex gap-2 border shadow-xl rounded-lg text-black p-2 bg-[#FAEBD7]">
                    <span className="w-[35%]">Update Content : </span>
                    <input
                      type="file"
                      name="bkCon"
                      // value={bkCon}
                      accept=".pdf"
                      required
                      placeholder="Add your books pdf"
                      onChange={(e) => setBkCon(e.target.files)}
                      className="w-full h-full"
                    ></input>
                  </div> */}
                <button
                  type="submit"
                  onClick={editbook}
                  className="w-[20%] h-[3rem] bg-primary mt-2 rounded-md hover:scale-110 active:scale-90 ease-in-out duration-200"
                >
                  Update
                </button>
              </form>
            </div>
            <div className="p-16">
              <div className="p-8 bg-white dark:bg-neutral-700  shadow-lg mt-24 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="text-center">
                    <div className=""></div>

                    <div className="rating-section">
                      <StarRating rating={userRating} onRating={submitRating} />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="w-60 h-39 bg-indigo-100 mx-auto shadow-2xl relative inset-x-0 top-0 -mt-24 flex items-center justify-center">
                      <img
                        src={bookDetail?.bkImagePath ?? "img"}
                        alt=""
                        className="w-auto rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-x-8 flex justify-between mt-32 md:mt-0 md:justify-center">
                    <Link
                      to={`/autor-profile/${bookDetail?.authName}`}
                      className="text-white w-30 h-20 py-2 px-4 flex items-center justify-center uppercase rounded bg-blue-400 dark:bg-amber-500 hover:bg-blue-500 dark:hover:bg-amber-600 shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5 active:-translate-y-2"
                    >
                      View Author Profile
                    </Link>
                    <Link
                      to={`/bookview/${bkname}`}
                      target="_blank"
                      className="text-white w-30 h-20 flex items-center justify-center py-2 px-4 uppercase rounded bg-gray-700 dark:bg-orange-500 hover:bg-gray-800 dark:hover:bg-orange-600 shadow hover:shadow-lg font-medium transition transform hover:-translate-y-0.5 active:-translate-y-2"
                    >
                      Read book
                    </Link>
                  </div>
                </div>

                <div className="mt-20 text-center border-b pb-12 capitalize">
                  <h1 className="text-4xl font-semibold text-gray-700 dark:text-white">
                    {bookDetail?.bkName ?? "book-name"}
                  </h1>

                  {/* <button onClick={addToFavorites} className=" mt-4 favorite-button mx-auto shadow-2xl relative inset-x-0 top-0 -mt-24 flex items-center justify-center ">
                <AiFillHeart className="mr-2" /> Add to Favorites
                </button>*/}
                  {isFavorited ? (
                    <button
                      onClick={removeFromFavorites}
                      className="mt-4 favorite-button mx-auto shadow-2xl relative inset-x-0 top-0 -mt-24 flex items-center justify-center"
                    >
                      <AiFillHeart className="mr-2" /> Remove from Favorites
                    </button>
                  ) : (
                    <button
                      onClick={addToFavorites}
                      className="mt-4 favorite-button mx-auto shadow-2xl relative inset-x-0 top-0 -mt-24 flex items-center justify-center"
                    >
                      <AiFillHeart className="mr-2" /> Add to Favorites
                    </button>
                  )}

                  <p className="mt-4 text-gray-500 dark:text-gray-200">
                    {bookDetail?.bkGenre ?? "book-genre"}
                  </p>
                  <p className="mt-2 text-gray-500 dark:text-gray-300">
                    Author : {bookDetail?.authName ?? "book-author"}
                  </p>
                  {/* Display the average rating here */}
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Rating: {averageRating} ★
                  </p>
                </div>
                <div className="mt-4 flex flex-col border-b justify-center text-center capitalize">
                  <p className="text-black text-center font-light lg:px-16 dark:text-white">
                    {bookDetail?.bkDesp ?? "book-description"}
                  </p>
                </div>
                <div className="mt-12 flex flex-col justify-center capitalize">
                  {/* <div className="mt-10 border-b pb-12">
                    <BookView chapters={bookDetail?.chapters} />
                  </div> */}

                  {isPremium && (
                    <form className="comment-form-container" onSubmit={submitComment}>
                      <input
                        type="text"
                        className="input-class placeholder-white outline-none shadow-sm shadow-primary"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        required
                      />
                      <button type="submit" className="border p-2 rounded-xl bg-primary hover:-translate-y-1 active:translate-y-1 shadow-sm shadow-primary ease-in-out duration-200">
                        Submit Comment
                      </button>
                    </form>
                  )}

                  <button
                    onClick={() => setCommentOpen(!commentOpen)}
                    className="text-indigo-500 py-2 px-4 font-medium mt-4 dark:text-cyan-400"
                  >
                    Show comments
                  </button>

                  {commentOpen && (
                    <div className="opacity-100 ease-in-out duration-200 mt-5 h-auto shadow-xl flex flex-col gap-1 p-4 border rounded-lg bg-white dark:bg-neutral-700 dark:text-white text-black">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment?._id} className="flex gap-10">
                            <div className="w-20 h-20 rounded-full overflow-hidden">
                              <div className="comment-profile-pic">
                                <img
                                  src={comment?.profileimage ?? "/assests/booksanime-ezgif.com-crop.gif"}
                                  alt={`${comment?.username}'s profile`}
                                  className="profile-photo"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="text-xl text-primary justify-between">
                                <span>{comment.username}</span>
                              </div>
                              <p className="text-xl">{comment.comment}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No comments yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BookDetail;
