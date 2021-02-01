import React, { useState, useEffect, useRef } from "react";
import Item from "../components/Item";
import DropWrapper from "../components/DropWrapper";
import Col from "../components/Col";
import { data, statuses } from "../data";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

import socketIOClient from "socket.io-client";
const SERVER_ENDPOINT = "https://trello-family-backend.herokuapp.com/"; // Development: "localhost:3000" // Production: "https://trello-family-backend.herokuapp.com/"

let socket;
let itemId;

// Runs every time something is re-rendered.
const Homepage = () => {
    const [items, setItems] = useState([]);

    /* @desc Connect to the socket server on componentDidMount with useEffect */
    useEffect(() => {
        socket = socketIOClient(SERVER_ENDPOINT, {});
        socket.emit("joinRoom");
        socket.emit("getItems");

        // Incoming responses
        socket.on("getItemsResponse", (data, dataLength) => {
            console.log("Data sent from the server, getItemsResponse: ");
            console.log(data);
            console.log(dataLength);
            if (!data) {
                itemId = Math.floor(Math.random() * (98) + 1);
            } else if (!dataLength) {
                itemId = data.id;
            } else {
                itemId = data.reduce((max, currentObj) => (currentObj.id > max ? currentObj.id : max), data[0].id)
            }
            // itemId = data.length ? data.length : 0;
            if (!itemId) itemId = 0; // will check for empty strings (""), null, undefined, false and the numbers 0 and NaN
            let a=[];
            if (!dataLength) {
                a.push(data)
                setItems(a);
            } else {
                setItems([...data]);
            }
        })
        socket.on("createTask", data => {
            console.log("Data sent from the server in createTask procedure: ");
            console.log(data);
        });
        socket.on("deleteTask", data => {
            console.log("Data sent from the server in deleteTask procedure: ");
            console.log(data);
        });

        /* Clean up the effect (disconnect from socket server) */
        return () => socket.disconnect();
    }, []);    

    // @desc    Update data when user drops a task/card in a column. 
    const onDrop = (item, monitor, status) => {
        const mapping = statuses.find(statusObj => statusObj.status === status);
        setItems(prevState => {
            const newItems = prevState
                .filter(itemObj => itemObj.id !== item.id)
                .concat({ ...item, status, icon: mapping.icon });
            console.log(newItems);
            socket.emit("updateTask", newItems.filter((itemElement) => itemElement.id === item.id)[0], newItems);
            return [...newItems];
        });
    };

    // @desc    Currently not in use. 
    const moveItem = (dragIndex, hoverIndex) => {
        const item = items[dragIndex];
        setItems(prevState => {
            const newItems = prevState.filter((itemObj, idNr) => idNr !== dragIndex);
            newItems.splice(hoverIndex, 0, item);
            return [...newItems];
        });
    };

    // @desc    Create a new task in front- and backend.
    // @route   POST /createTask
    const addItem = async (statusId) => {
        /* Create new task data */
        const iconAndStatus = statusAndIcon(statusId);
        itemId += 1;
        console.log("itemId" + itemId);
        let item = {
            id: itemId,
            icon: iconAndStatus.icon,
            status: iconAndStatus.status,
            title: "Untitled.",
            content: "None.",
            created: new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
            modified: new Date().toJSON().slice(0, 10).replace(/-/g, '/'),
            activity: [],
            currentComment: "",
        };

        /* Update state in database */
        item.icon = statusId;
        socket.emit("createTask", item);
        item.icon = iconAndStatus.icon;

        /* Update states in front-end */
        setItems(prevState => {
            const newItems = prevState;
            newItems.splice(prevState.length, 0, item);
            return [...newItems];
        });

        socket.emit("getItems");
    };

    // @desc    Map an column/status id with the correct symbol.
    const statusAndIcon = (statusId) => {
        let icon;
        let status;
        if (statusId == 0) {
            icon = "⭕️";
            status = "open";
        }
        else if (statusId == 1) {
            icon = "🔆️";
            status = "in progress";
        }
        else if (statusId == 2) {
            icon = "📝";
            status = "in review";
        }
        else if (statusId == 3) {
            icon = "✅";
            status = "done";
        }
        return { icon, status };
    }

    // @desc    Update front-end state when user types in description bar. 
    const handleDescChange = (event, itemIndex) => {
        event.persist();
        setItems(prevState => {
            const newItems = prevState;
            const modifiedItem = prevState.find(itemObj => itemObj.id == itemIndex);
            modifiedItem.content = event.target.value;
            modifiedItem.modified = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            newItems[itemIndex - 1] = modifiedItem;
            //console.log(newItems);
            return [...newItems];
        });
    }

    // @desc    Update front-end state when user types in title bar. 
    const handleTitleChange = (event, itemIndex) => {
        event.persist();
        setItems(prevState => {
            const newItems = prevState;
            const modifiedItem = prevState.find(itemObj => itemObj.id == itemIndex);
            modifiedItem.title = event.target.value;
            modifiedItem.modified = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
            newItems[itemIndex - 1] = modifiedItem;
            //console.log(newItems);
            return [...newItems];
        });
    }

    // @desc    Update front-end state when user types in comment bar. 
    const handleCommentChange = (event, itemIndex) => {
        event.persist();
        setItems(prevState => {
            const newItems = prevState;
            const modifiedItem = prevState.find(itemObj => itemObj.id == itemIndex);
            modifiedItem.currentComment = event.target.value;
            newItems[itemIndex - 1] = modifiedItem;
            return [...newItems];
        });
    }

    // @desc    Update front-end state when user clicks "Save comment". 
    const handleCommentSave = (itemIndex) => {
        setItems(prevState => {
            const newItems = prevState;
            const modifiedItem = prevState.find(itemObj => itemObj.id == itemIndex);
            modifiedItem.activity.splice(modifiedItem.activity.length, 0, modifiedItem.currentComment);
            modifiedItem.currentComment = "";
            newItems[itemIndex - 1] = modifiedItem;
            return [...newItems];
        });
    }

    // @desc    Update task/card in database. 
    // @route   PUT /updateTask
    const handleSaveCard = async (itemIndex) => {
         /* Update database */
         console.log("Update database request sent."); 
         socket.emit("updateTask", !items ? [] : items.filter((item) => item.id === itemIndex)[0], items); // Change
         alert("Save was successful");
    }

    // @desc    Remove task/card from application. 
    // @route   DELETE /deleteTask
    const handleArchiveCard = async (itemIndex) => {
        /* Update database */
        socket.emit("deleteTask", itemIndex, !items ? [] : items.filter((item) => item.id !== itemIndex)[0]); // Change

        /* Update state in front-end */
        await setItems(prevState => {
            return [...prevState.filter(itemObj => itemObj.id !== itemIndex)];
        });
    }

    // @desc    Move task/card left or right (requirement for mobile use). 
    const handleItemButtonMove = (item, statusId, directionAllCaps) => {
        if (directionAllCaps === "LEFT" && statusId !== 0) {
            statusId--;
        }
        else if (directionAllCaps === "RIGHT" && statusId !== 3) {
            statusId++;
        }
        const iconAndStatus = statusAndIcon(statusId);
        setItems(prevState => {
            const newItems = prevState
                .filter(itemObj => itemObj.id !== item.id)
                .concat({ ...item, status: iconAndStatus.status, icon: iconAndStatus.icon });
            socket.emit("updateTask", newItems.filter((itemElement) => itemElement.id === item.id)[0], newItems);
            return [...newItems];
        });
        
    }

    return (
        <div className={"row"}>
            {statuses.map((statusObj, statusId) => {
                return (
                    <div key={statusId} className={"col-wrapper"}>
                        <h2 className={"col-header"}>{statusObj.status.toUpperCase()}</h2>
                        <DropWrapper onDrop={onDrop} status={statusObj.status}>
                            <Col>
                                {!items ? [] : items.filter(itemObj => itemObj.status === statusObj.status).map((itemObj, idNr) => <Item key={itemObj.id} item={itemObj} index={idNr} moveItem={moveItem} status={statusObj} statusId={statusId} handleItemButtonMove={handleItemButtonMove} handleDescChange={handleDescChange} handleTitleChange={handleTitleChange} handleCommentSave={handleCommentSave} handleCommentChange={handleCommentChange} handleSaveCard={handleSaveCard} handleArchiveCard={handleArchiveCard} />)}
                                <p id={statusId} className="add-btn" onClick={() => addItem(statusId)}><a><FontAwesomeIcon icon={faPlus} /> Add a card</a></p>
                            </Col>
                        </DropWrapper>
                    </div>
                );
            })}
        </div>
    );
};

export default Homepage;