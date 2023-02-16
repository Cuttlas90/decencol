import { useState } from 'react'
import '../../Styles/Navbar.css'
export default function Navbar(props){
    const [showSubNav,setShowSubNav] = useState(null);
    return(
        <>
        <div className="mainNavbar">
            <button onClick={()=>setShowSubNav('folder')} className="btn btn-outline-primary">Folder</button>
            <button onClick={()=>{setShowSubNav('create');props.setSection("creator")}} className="btn btn-outline-primary">create</button>
        </div>
        { showSubNav ==="folder" &&
            <div className='subNavbar'>
            <button onClick={()=>props.setSection("myFile")} className="btn btn-outline-primary">My IPFS Doc</button>
            <button onClick={()=>props.setSection("shared")} className="btn btn-outline-primary">Shared with me</button>
        </div>
}
        </>
    )
}