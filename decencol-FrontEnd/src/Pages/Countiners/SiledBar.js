import '../../Styles/sidebars.css'
import { useEffect, useRef, useState } from "react";
import { useDispatch,useSelector } from 'react-redux';
import { selectUser } from '../../features/Private/PrivateSlice';

export default function SildeBar(props) {
    const dispatch = useDispatch();
    const mounted = useRef(true);
    const [isClosed, setIsClosed] = useState(false);
    const getMyFilesAPI = useSelector(selectUser).getMyFiles;


    const hamburger_cross = () => {
        document.querySelector("#wrapper").classList.toggle("toggled");
        // document.querySelector("#userSettings").classList.toggle("toggled");
        if (isClosed === true) {
            document.querySelector(".hamburger").classList.remove("is-open");
            document.querySelector(".hamburger").classList.add("is-closed");
            setIsClosed(false);
        } else {
            document.querySelector(".hamburger").classList.remove("is-closed");
            document.querySelector(".hamburger").classList.add("is-open");
            setIsClosed(true);
        }
    };

    // for expand sidebar if click on i tag
    const expandSidebar = () => {
        document.querySelector("#wrapper").classList.add("toggled");
        // document.querySelector("#userSettings").classList.add("toggled");
        document.querySelector(".hamburger").classList.remove("is-closed");
        document.querySelector(".hamburger").classList.add("is-open");
        setIsClosed(true);

    };

    //useEffect for open allways load sildebar
   /*
    useEffect(() => {
        var screen = window.screen.width;
        if (mounted.current && screen > 900) {
            hamburger_cross();
        }
        return () => mounted.current = false;
    }, [])
*/

    // for resize higth of sidebarList
    const [heightAlert, setHeightAlert] = useState("");
    const [screenSize, getDimension] = useState({
        dynamicWidth: window.innerWidth,
        dynamicHeight: window.innerHeight
    });
    const setDimension = () => {
        getDimension({
            dynamicWidth: window.innerWidth,
            dynamicHeight: window.innerHeight
        })
    }
    useEffect(() => {
        window.addEventListener('resize', setDimension);

        return (() => {
            window.removeEventListener('resize', setDimension);
        })
    }, [screenSize, heightAlert]);
    useEffect(() => {
        // setHeightAlert(document.getElementById("alertBeta").offsetHeight + 80);
        if (document.getElementById("userPageCountiner")) document.getElementById("userPageCountiner").style.height = "calc(100vh - " + heightAlert + "px)";
    }, [heightAlert, screenSize])


    return (
        <>
            <div id='sidebarBody' className="sidebarBody">
                <div id="wrapper">
                    <nav className="navbar navbar-inverse" id="sidebar-wrapper" role="navigation">
                        <ul className="nav sidebar-nav">
                            <div className="sidebar-header">
                                <div className="sidebar-brand ">
                                    <div className='sidbarProfilehead'>
                                        Dashboard
                                    </div>
                                </div>
                            </div>
                            <li className="" onClick={()=>props.setSection("all")}>
                                <div className="w-100 pe-3">
                                    <i /*onClick={() => expandSidebar()}*/ className='icon liStatic'>folder_open</i>
                                    <div className='w-100 ps-2 fs-6'>All Documents</div>
                                </div>
                            </li>
                            <li className="" onClick={()=>props.setSection("myShared")}>
                                <div className="w-100 pe-3">
                                    <i /*onClick={() => expandSidebar()}*/ className='icon liStatic text-primary'>share</i>
                                    <div className='w-100 ps-2 fs-6'>My shared Docs</div>
                                </div>
                            </li>
                            <li className="" onClick={()=>props.setSection("sharedWithMe")}>
                                <div className="w-100 pe-3">
                                    <i /*onClick={() => expandSidebar()}*/ className='icon liStatic text-success'>share</i>
                                    <div className='w-100 ps-2 fs-6'>shared with me</div>
                                </div>
                            </li>
                            <li className="" onClick={()=>props.setSection("creator")}>
                                <div className="w-100 pe-3">
                                    <i /*onClick={() => expandSidebar()}*/ className='icon liStatic'>create_new_folder</i>
                                    <div className='w-100 ps-2 fs-6'>Create New Doc</div>
                                </div>
                            </li>
                        </ul>
                    </nav>
                    <button type="button" onClick={() => hamburger_cross()} className="hamburger animated fadeInLeft is-closed" data-toggle="offcanvas">
                        <span className="hamb-top"></span>
                        <span className="hamb-middle"></span>
                        <span className="hamb-bottom"></span>
                    </button>
                </div>
                {/* <li id="userSettings">
                    <a href='' className="w-100 pe-3 overflow-hidden">
                        <i onClick={() => expandSidebar()} className='icon liStatic '>manage_accounts</i>
                        <div className='w-100 ps-2 fs-6'>User Account</div>
                    </a>
                </li> */}
            </div>
        </>
    )
}