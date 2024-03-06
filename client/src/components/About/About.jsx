import React from 'react';
import "./About.css";

const About = () => {
  return (
    <section className='about'>
      <div className='container'>
        <div className='section-title'>
          
        </div>

        <div className='about-content grid ' >
          <div className='about-img' >
            <img src="\assests\about-img.jpg" alt="Library" /> {/* Use the library image */}
          </div>
          <div className='about-text '>

            <h2 className='about-title'style={{ fontFamily: ' sans-serif', fontSize: '30px',  padding: '10px', borderRadius: '5px' }}>About Explore</h2>
            <div className='about-description'style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', backgroundColor: '#80a5ef;', padding: '10px', borderRadius: '5px' }}>

            <p> Explore is an ebook website that caters to readers of all age groups.</p> 
            <p>It offers a diverse range of genres, including religious literature, magazines, and children's books.</p>
          <p>   One of the key features of Explore is the ability for users to rate and comment over a book. </p>
            <p> In addition, Explore offers various premium plans that users can select, granting them premium user status and unlocking exclusive features. </p>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About;
