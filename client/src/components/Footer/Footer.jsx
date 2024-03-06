import React from "react";
import { FaLocationArrow, FaMobileAlt, FaEnvelope, FaInstagram } from "react-icons/fa";
import LogoLight from "../../assets/website/logo.png";
import LogoDark from "../../assets/website/logoDark.png";

const yourGmail = "explorethebooks3002@gmail.com"; // Replace your_email@gmail.com with your actual Gmail address

const FooterLinks = [
  {
    id: 1,
    title: "About",
    link: "/about"
  },
  
  {
    id: 3,
    title: "Gmail",
    link: `mailto:${yourGmail},${yourGmail}`, // Include your Gmail address twice
    icon: <FaEnvelope />,
  },
  {
    id: 4,
    title: "Instagram",
    link: "https://www.instagram.com/_.aakanshaa.__/", // Change your_instagram_username to your Instagram username
    icon: <FaInstagram />,
  },
];

const Footer = () => {
  return (
    <div className="bg-gray-100 dark:bg-neutral-800">
      <section className="container">
        <div className="grid md:grid-cols-3 py-5">
          {/* company Details */}
          <div className=" py-8 px-4 ">
            <h1 className="sm:text-3xl text-xl font-bold sm:text-left text-justify mb-3 flex items-center gap-3">
              <img
                src={LogoDark}
                alt="Logo"
                className="logo-dark hidden dark:flex max-w-[150px]"
              />
              <img
                src={LogoLight}
                alt="Logo"
                className="logo-light flex dark:hidden max-w-[150px]"
              />
            </h1>
            <br />
            <div className="flex items-center gap-3">
              <FaLocationArrow />
              <p>Mumbai</p>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <FaMobileAlt />
              <p>+91 8097221590</p>
            </div>
          </div>
          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 col-span-2 md:pl-10 ">
            <div className="">
              <div className="py-8 px-4 ">
                <ul className={`flex flex-col gap-3`}>
                  {FooterLinks.map((link) => (
                    <li
                      key={link.id}
                      className="cursor-pointer hover:translate-x-1 duration-300 hover:text-primary space-x-1 text-gray-500"
                    >
                      <span>&#11162;</span>
                      
                      
                      <a href={link.link} target="_blank" rel="noopener noreferrer">
                        {link.icon}
                        <span>{link.title}</span>
                        
                      </a>
                    </li>
                    
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div></div>
      </section>
    </div>
  );
};

export default Footer;
