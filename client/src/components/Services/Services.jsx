import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../loading";
import { Link } from "react-router-dom";

// const ServicesData = [
//   {
//     id: 1,
//     img: Img1,
//     title: "His Life",
//     description:
//       "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//   },
//   {
//     id: 2,
//     img: Img2,
//     title: "Who's there",
//     description:
//       "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//   },
//   {
//     id: 3,
//     img: Img3,
//     title: "Lost Boy",
//     description:
//       "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
//   },
// ];

const Services = () => {
  const [magadata, setMagadata] = useState();
  const fetchmagazines = async () => {
    const magazineColl = "magazines";
    try {
      axios.post("http://localhost:3001/get-mag", magazineColl).then((res) => {
        const databook = res.data.data; //data.data??
        // alert(res.data.message);
        setMagadata(databook);
        // setBkByAdmin(databook.length);
        // setBkByAdmin(databook.filter((book) => book.role === "admin"));
        // setBkByUser(databook.filter((book) => book.role === "user"));
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
  console.log(magadata);
  return (
    <>
      <span id="services"></span>
      <div className="py-10 dark:bg-neutral-950">
        <div className="flex flex-col  gap-5">
          <div className="text-center mb-20 max-w-[450px] mx-auto ">
            <p className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary ">
              To learn to read is to light a fire; every syllable that is
              spelled is a spark
            </p>
            <h1 className="text-3xl font-bold">New Magazines</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-20 md:gap-5 place-items-center">
            {magadata == undefined && <span>undefined</span>}
            {magadata != undefined &&
              magadata.map((i) => (
                <div
                  key={i.magName}
                  data-aos="zoom-in"
                  className="rounded-2xl bg-white dark:bg-neutral-900 hover:bg-primary dark:hover:bg-primary hover:text-white relative shadow-xl duration-high group max-w-[300px]"
                >
                  <div className="h-[100px]">
                    <img
                      src={i.magImage}
                      alt=""
                      className="max-w-[100px] block mx-auto transform -translate-y-14
                  group-hover:scale-105  duration-300 shadow-md"
                    />
                  </div>
                  <div className="p-4 text-center">
                    {/* <div className="w-full flex items-center justify-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-yellow-500" />
                  </div> */}
                    <h1 className="text-xl font-bold">{i.magName}</h1>
                    <p className="text-gray-500 group-hover:text-white duration-high text-sm line-clamp-2">
                      {i.magDesp}
                    </p>
                    <Link
                      to={`/admin/books/magazines-detail/${i.magName}`}
                      target="_parent"
                    >
                      <button
                        className="bg-primary hover:scale-105 duration-300 text-white py-1 px-4 rounded-full mt-4 group-hover:bg-white group-hover:text-primary"
                      // onClick={handleOrderPopup}
                      >
                        Read Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
          <div className="w-full flex items-center justify-center">
            <a
              href={"/magasearch"}
              className="w-40 h-14 flex gap-3 items-center justify-center bg-gradient-to-r cursor-pointer from-primary to-secondary hover:scale-105 duration-200 text-white py-1 px-2 rounded-full active:scale-95"
            >
              Explore More
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;
