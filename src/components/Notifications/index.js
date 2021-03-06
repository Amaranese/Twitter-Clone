import React, {useEffect} from 'react'
import './style.scss'

const Notifications = () => {

    useEffect(() => {
        document.getElementsByTagName("body")[0].style.cssText = "position:fixed; overflow-y: scroll;"
    },[])
    useEffect( () => () => document.getElementsByTagName("body")[0].style.cssText = "", [] )
    return(
        <div className="workInProgress">
            This is a work in progress
        </div>
    )
}

export default Notifications