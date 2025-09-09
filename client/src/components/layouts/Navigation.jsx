import React from "react";
import { NavLink } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <i className="fas fa-leaf"></i>
        <span>KidsLearn</span>
      </div>
      <ul className="nav-list">
        <li className="nav-item">
          <a href="http://localhost:5000/home.html" className="nav-link">
            ပင်မစာမျက်နှာ
          </a>
        </li>
        <li className="nav-item">
          <a href="http://localhost:5000/home.html#lesson" className="nav-link">
            သင်ခန်းစာများ
          </a>
        </li>
        <li className="nav-item">
          <NavLink to="/chat-page" className="nav-link">
            စကားပြောခန်း
          </NavLink>
        </li>
        {/* <li className="nav-item">
          <NavLink to="/login" className="nav-link">
            အကောင့်ဝင်ရန်
          </NavLink>
        </li> */}
      </ul>
    </nav>
  );
};

export default Navigation;
