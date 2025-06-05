import animation from "./../assets/home.json";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import { useState } from "react";
import RoleChange from "./RoleChangeSection";
export default function TopNavbar({ appname, pagename, onClick, show }) {
  const [toggle, setToggle] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="bg-light sticky-top">
      <div className="d-flex flex-wrap align-items-center p-2 justify-content-end">
        <div className="d-flex flex-row align-items-center">
          <button className="btn btn-link text-secondary p-0" onClick={onClick}>
            <svg
              className="bi bi-list w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="fill-current"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
              ></path>
            </svg>
          </button>
          <h3 className="text-center h5 font-weight-bold text-purple ml-2">
            {pagename}
          </h3>
        </div>
        <div className="text-center flex-grow-1 p-1 h5 font-weight-bold text-purple">
          {appname}
        </div>
        <button
          onClick={() => {
            setToggle(!toggle);
          }}
          className="btn btn-light d-md-none p-2 rounded-lg ml-3"
          type="button"
          aria-expanded="false"
        >
          <span className="sr-only">
            {toggle ? "Close main menu" : "Open main menu"}
          </span>
          <i className="fa {{ toggle ? 'fa-times' : 'fa-user' }}"></i>
        </button>
        <div className="w-100 w-md-auto mt-4 mt-md-0 {{ !toggle ? 'd-none' : '' }}">
          <div
            className="d-flex float-right"
            style={{ animation: "fadeInRight 2s ease-out" }}
          >
            {show && <RoleChange />}
          </div>
        </div>
      </div>
    </div>
  );
}
