import React, {useContext, useState, useEffect, useRef} from 'react'
import { StoreContext } from '../../store/store'
import './style.scss'
import {API_URL} from '../../config'
import { withRouter } from 'react-router-dom';
import { token } from '../../store/middleware'
import io from 'socket.io-client'
import moment from 'moment'
import {useMediaQuery} from 'react-responsive'
import { ICON_ARROWBACK, ICON_SEND} from '../../Icons'

let socket = io.connect(API_URL,{
    query: {token: token()}
})

const ChatPage = (props) => {

    const { state, actions } = useContext(StoreContext)
    const [room, setRoom] = useState(null)
    const [conversation, setConversation] = useState([])
    const [text, setText] = useState('')
    const mounted = useRef()
    const roomRef = useRef()
    
    const {account} = state
    useEffect(() => {
        if(props.history.location.pathname.slice(10).length === 24)
        getConversation(props.history.location.pathname.slice(10))
        //check when component unmounts
        return () => {
            if(roomRef.current){ socket.emit('leaveRoom', roomRef.current) } }
      }, [props.history.location.pathname])
    

    useEffect(() => {
        if(!mounted.current){
            mounted.current = true
        }else{
            if(document.querySelector('#messageBody')){
                let messageBody = document.querySelector('#messageBody');
                messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
            }
            socket.on('output', msg => {
                let currConversation = conversation
                currConversation.push(msg)
                setConversation(currConversation)
                setText((text)=>[...text, ''])
                let messageBody = document.querySelector('#messageBody');
                messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
              })
              
        }
    }, [conversation])

    const fillConversation = params => {
        setConversation(params)
     }

     const sendMsg = () => {
        if(text.length>0){
            document.getElementById('chat').value = "";
            let id = state.conversation.participants[0] !== state.account._id ? state.conversation.participants[0] : state.conversation.participants[1]
            socket.emit('chat', { room: room, id, content: text })
        }
    }

    const getConversation = (id) => {
        if(room){ socket.emit('leaveRoom', room) }
        socket.emit('subscribe', id);
        setRoom(id)
        roomRef.current = id
        actions.getSingleConversation({id:id, func: fillConversation})
     }

    const handleInputChange = (e) => {
        setText(e.target.value)
    }

    const handleKeyDown = (e) => {
        console.log(conversation)
        if(e.keyCode === 13){
            sendMsg()
        } 
    }

    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 888px)' })
    
    return(
        <div className={props.res ? "chat-wrapper" : "chat-wrapper chat-right"}>
        {account ? isTabletOrMobile && !props.res ? null : 
         <div className="chat-height" >
            <div className="chat-header-wrapper">  
                {props.res && <div className="profile-header-back">
                    <div onClick={()=>window.history.back()} className="header-back-wrapper">
                        <ICON_ARROWBACK/>
                    </div>
                </div> }
                {/* <h4>
                     Ali hd
                </h4>
                <span>
                    @alihd
                </span> */}
            </div>
            <div className="conv-div">
                <div id="messageBody" className="conversation-wrapper">
                {room ? 
                conversation.map((msg,i) => {
                return <div key={msg._id}>
                        {msg.sender.username === account.username ? 
                            <div className="users-box">
                                <div className="users-msg">
                                    <div className="users-content">
                                        {msg.content}
                                    </div>
                                </div>
                                {i>0 && moment.duration(moment(msg.createdAt).diff(moment(conversation[i-1].createdAt))).asMinutes() > 1  ? 
                                <div className="users-date">
                                    {moment(msg.createdAt).format("MMM D, YYYY, h:mm A")}
                                </div> : <div style={{marginTop:'-20px'}}></div>}
                            </div>
                        :
                        <div className="sender-box">
                            <div className="sender-msg">
                                <div className="sender-content">
                                    {msg.content}
                                </div>
                            </div>
                            {i>0 && moment.duration(moment(msg.createdAt).diff(moment(conversation[i-1].createdAt))).asMinutes() > 1  ? 
                                <div className="sender-date">
                                    {moment(msg.createdAt).format("MMM D, YYYY, h:mm A")}
                                </div> : <div style={{marginTop:'-20px'}}></div>}
                        </div>}
                    </div>
                }) : 
                <div className="not-selected-msg">
                    <div>
                        You dont have a message selected
                    </div>
                    <p>Choose one from your existing messages, on the left.</p>
                </div>  }          
                </div>
            </div>
            <div className="chat-bottom-wrapper">
                <div className={room? "chat-input-container active" : "chat-input-container"}>
                <input disabled={!room} onKeyDown={(e)=>handleKeyDown(e)} onChange={(e)=>handleInputChange(e)} placeholder="Start a new message" id="chat" type="text" name="message" />
                <div onClick={sendMsg}>
                    <ICON_SEND />
                </div>
                </div>
            </div>
            </div> : null }
        </div>
    )
}

export default withRouter(ChatPage)