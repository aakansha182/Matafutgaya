import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiTwotoneDelete } from "react-icons/ai";

const Comments = () => {
  const [bookdata, setBookdata] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchComments = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/get-comment",
        "comments"
      );
      setBookdata(response.data.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const delComment = (comment) => {
    axios
      .post("http://localhost:3001/delcomment", { _id: comment._id })
      .then((res) => {
        alert(res.data.message);
        if (res.data.status === "del") {
          fetchComments();
        }
      });
  };

  const filteredComments = bookdata.filter((comment) =>
    comment.bkName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className=" mt-6 main-book relative overflow-hidden flex flex-col">
      <div className="search">
        <input
          type="text"
          placeholder="Search by book name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="h-12 bg-neutral-800  text-white px-4  border-2 border-white w-[99%] rounded-md placeholder-gray-200 "
        />
      </div>
      <h1 className="tbhead text-3xl -mb-10">Comment Table</h1>
      <div className="scrollDi">
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Book Name</th>
                <th>Username</th>
                <th>Comment</th>
                <th>Time</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((comment) => (
                <tr key={comment._id}>
                  <td className="tbname">{comment.bkName}</td>
                  <td className="tbname">{comment.username}</td>
                  <td className="tbdesp">{comment.comment}</td>
                  <td>{comment.createdAt}</td>
                  <td>
                    <div className="w-full h-auto p-8 flex flex-col justify-center gap-5 text-white">
                      <AiTwotoneDelete
                        size={30}
                        onClick={() => delComment(comment)}
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
    </div>
  );
};

export default Comments;
