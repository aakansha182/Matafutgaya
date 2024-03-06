import { FaHeadphonesSimple } from "react-icons/fa6";
import { GiSpellBook } from "react-icons/gi";
import { ImUserTie } from "react-icons/im";
import { FaBookReader } from "react-icons/fa";
import { BsMenuButtonWide } from "react-icons/bs";
import { ImNewspaper } from "react-icons/im";
const Report = () => {
  return (
    <main className="main-inv w-full h-auto overflow-hidden">
      <div className="flex flex-col gap-5">
        <div className="inven">
          <a href="/admin/bkratings" className="inv-list">
            <div className="invcar">
              <div className="invcard-inner">
                <h3>Book Ratings</h3>
                <GiSpellBook className="invicon" />
              </div>
            </div>
          </a>
          <a href="/admin/audioratings" className="inv-list">
            <div className="invcar">
              <div className="invcard-inner">
                <h3> Audiobook Ratings</h3>
                <FaHeadphonesSimple className="invicon" />
              </div>
            </div>
          </a>
        </div>
        <div className="inven">
          <a href="/admin/magaratings" className="inv-list2">
            <div className="invcar">
              <div className="invcard-inner">
                <h3>Magazine Ratings</h3>
                <ImNewspaper className="invicon" />
              </div>
            </div>
          </a>
          <a href="/admin/transaction" className="inv-list2">
            <div className="invcar">
              <div className="invcard-inner">
                <h3>Overall Transactions</h3>
                <FaBookReader className="invicon" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
};

export default Report;
