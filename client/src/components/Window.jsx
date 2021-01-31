import React from "react";
import Modal from "react-modal";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faSave, faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons'

Modal.setAppElement("#app");

function eraseText() {
    document.getElementById("activity-textarea").value = "";
}

// Prop names come from the documentation from react-modal
const Window = ({ show, onClose, item, statusId, handleItemButtonMove, handleDescChange, handleTitleChange, handleCommentSave, handleCommentChange, handleSaveCard, handleArchiveCard }) => {
    return (
        <Modal
            isOpen={show}
            onRequestClose={onClose}
            className={"modal"}
            overlayClassName={"overlay"}
        >
            <div className={"close-btn-ctn"}>
                <input value={item.title} onChange={(event) => handleTitleChange(event, item.id)} style={{ flex: "1 90%", background: "transparent", border: "none", fontSize: "40px", height: "75px" }}></input>
                <button className="close-btn" onClick={onClose}>X</button>
            </div>
            <div>
                <p style={{fontSize: "1.5em", fontWeight: "bolder"}}>Description</p>
                <textarea className="input-field" value={item.content} onChange={(event) => handleDescChange(event, item.id)} maxLength={250} style={{background: "transparent", border: "none"}}></textarea>
                <p style={{fontSize: "1.5em", fontWeight: "bolder"}}>Status</p>
                <p>{`${item.status.charAt(0).toUpperCase()}${item.status.slice(1)}`} {item.icon}</p>
                <p>Created: {item.created}</p>
                <p>Modified: {item.modified}</p>
                <p>Move card: <a onClick={() => handleItemButtonMove(item, statusId, "LEFT")}><FontAwesomeIcon icon={faArrowCircleLeft} style={{fontSize:"20px"}}/>LEFT</a> or <a onClick={() => handleItemButtonMove(item, statusId, "RIGHT")}><FontAwesomeIcon icon={faArrowCircleRight} style={{fontSize:"20px"}}/>RIGHT</a></p>
            </div>
            <div style={{margin: "3vh 0rem 0rem 0rem"}}>
                <p style={{fontSize: "1.5em", fontWeight: "bolder"}}>Activity</p>
                <textarea id="activity-textarea" onChange={(event) => handleCommentChange(event, item.id)} className="input-field" placeholder={"Write a comment..."} maxLength={200} style={{width: "70%", borderRadius: "5px"}}></textarea>
                <button disabled={(item.activity.length == 5 ? true : false)} onClick={() => { handleCommentSave(item.id); eraseText(); }} type="submit" className="comment-btn" style={{bottom: "5%", borderRadius: "5px", margin: "0.5rem 0rem 0.5rem 0rem", display: "block"}}>Save comment</button>
                <span style={{color: "red"}}>{(item.activity.length == 5 ? "Max of 5 comments per card." : "")}</span>
                <div>{item.activity.map((comment, id) => <p key={id}>{id+1}. {comment}</p>)}</div>
            </div>
            <div className="archiveOrSaveTask">
                <a onClick={() => handleSaveCard(item.id)} ><h2>Save <FontAwesomeIcon icon={faSave}/></h2></a>
                <a onClick={() => handleArchiveCard(item.id)} style={{marginLeft: "10vw"}}><h2 >Archive <FontAwesomeIcon icon={faTrash}/></h2></a>
            </div>
        </Modal>
    );
};

export default Window;