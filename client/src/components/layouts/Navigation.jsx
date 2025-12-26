import React from "react";
import { NavLink } from "react-router-dom";
import "./Navigation.css"; // Original CSS 그대로 사용

// Import Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

const Navigation = () => {
  return (
    <header>
      <nav className="site-nav">
        <div className="site-nav__logo">
          <FontAwesomeIcon icon={faLeaf} className="leaf-logo"/>
          <span>KidsLearn</span>
        </div>
        <ul className="site-nav__list">
          <li className="site-nav__item">
            <a href="http://localhost:5000/home.html" className="site-nav__link">
              ပင်မစာမျက်နှာ
            </a>
          </li>
          {/* သင်ခန်းစာများ */}
          {/* <li className="site-nav__item">
            <a href="/home.html#lesson" className="site-nav__link">
              သင်ခန်းစာများ
            </a>
          </li> */}
          <li className="site-nav__item">
            <NavLink
              to="/chat-page"
              className={({ isActive }) =>
                isActive ? "site-nav__link site-nav__link--active" : "site-nav__link"
              }
            >
              စကားပြောခန်း
            </NavLink>
          </li>
          <li className="site-nav__item">
            <a href="http://localhost:5000/profile.html" className="site-nav__link">
              ကိုယ်ပိုင်စာမျက်နှာ
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;
