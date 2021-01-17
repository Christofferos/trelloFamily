import React, { useState } from "react";
import Item from "../components/Item";
import DropWrapper from "../components/DropWrapper";
import Col from "../components/Col";
import { data, statuses, nrOfItems } from "../data";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

let itemIncrementId = data.length;

// Runs every time something is re-rendered.
const Homepage = () => {
    const [items, setItems] = useState(data);

    // @desc    Update data when user drops a task/card in a column. 
    const onDrop = (item, monitor, status) => {
        const mapping = statuses.find(statusObj => statusObj.status === status);
        setItems(prevState => {
            const newItems = prevState
                .filter(itemObj => itemObj.id !== item.id)
                .concat({ ...item, status, icon: mapping.icon });
            console.log(newItems);
            return [ ...newItems ];
        });
    };

    // @desc    Currently not in use. 
    const moveItem = (dragIndex, hoverIndex) => {
        const item = items[dragIndex];
        setItems(prevState => {
            const newItems = prevState.filter((itemObj, idNr) => idNr !== dragIndex);
            newItems.splice(hoverIndex, 0, item);
            return  [ ...newItems ];
        });
    };

    // @desc    Create a new task in front- and backend.
    // @route   POST /createTask
    const addItem = async (statusId) => {
        /* Create new task data */
        itemIncrementId++;
        const iconAndStatus = statusAndIcon(statusId);
        const item = {
            id: itemIncrementId,
            icon: iconAndStatus.icon,
            status: iconAndStatus.status,
            title: "Untitled.",
            content: "None.",
            created: new Date().toJSON().slice(0,10).replace(/-/g,'/'),
            modified: new Date().toJSON().slice(0,10).replace(/-/g,'/'),
            activity: [],
            currentComment: "",
        };

        /* Update state in database */
        item.icon = statusId;
        const rawData = await fetch("/createTask", {
            method: "POST",
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        console.log(await rawData.json());
        item.icon = iconAndStatus.icon;

        /* Update states in front-end */
        setItems(prevState => {
            const newItems = prevState;
            newItems.splice(prevState.length, 0, item);
            return  [ ...newItems ];
        });
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
        return {icon, status};
    }

    // @desc    Update front-end state when user types in description bar. 
    const handleDescChange = (event, itemIndex) => {
        event.persist();
        setItems(prevState => {
            const newItems = prevState;
            const modifiedItem = prevState.find(itemObj => itemObj.id == itemIndex);
            modifiedItem.content = event.target.value;
            modifiedItem.modified = new Date().toJSON().slice(0,10).replace(/-/g,'/');
            newItems[itemIndex-1] = modifiedItem;
            //console.log(newItems);
            return [ ...newItems ];
        });
    }

    // @desc    Update front-end state when user types in title bar. 
    const handleTitleChange = (event, itemIndex) => {
        event.persist();
        setItems(prevState => {
            const newItems = prevState;
            const modifiedItem = prevState.find(itemObj => itemObj.id == itemIndex);
            modifiedItem.title = event.target.value;
            modifiedItem.modified = new Date().toJSON().slice(0,10).replace(/-/g,'/');
            newItems[itemIndex-1] = modifiedItem;
            //console.log(newItems);
            return [ ...newItems ];
        });
    }

    // @desc    Update front-end state when user types in comment bar. 
    const handleCommentChange = (event, itemIndex) => {
        event.persist();
        setItems(prevState => {
            const newItems = prevState;
            const modifiedItem = prevState.find(itemObj => itemObj.id == itemIndex);
            modifiedItem.currentComment = event.target.value;
            newItems[itemIndex-1] = modifiedItem;
            return [ ...newItems ];
        });
    }

    // @desc    Update front-end state when user clicks "Save comment". 
    const handleCommentSave = (itemIndex) => {
        setItems(prevState => {
            const newItems = prevState;
            const modifiedItem = prevState.find(itemObj => itemObj.id == itemIndex);
            modifiedItem.activity.splice(modifiedItem.activity.length, 0, modifiedItem.currentComment);
            modifiedItem.currentComment = "";
            newItems[itemIndex-1] = modifiedItem;
            return [ ...newItems ];
        });
    }

    // @desc    Remove task/card from application. 
    // @route   DELETE /deleteTask
    const handleArchiveCard = async (itemIndex) => {
        /* Update database */
        const rawData = await fetch("/deleteTask/"+itemIndex, {
            method: "DELETE",
        });
        console.log(await rawData.json());

        /* Update state in front-end */
        await setItems(prevState => {
            return [ ...prevState.filter(itemObj => itemObj.id !== itemIndex)];
        }); 
    }

    // @desc    Move task/card left or right (requirement for mobile use). 
    const handleItemButtonMove = (item, statusId, directionAllCaps) => {
        if (directionAllCaps === "LEFT" && statusId !== 0)
            statusId--;
        else if (directionAllCaps === "RIGHT" && statusId !== 3)
            statusId++;
        const iconAndStatus = statusAndIcon(statusId);
        setItems(prevState => {
            const newItems = prevState
                .filter(itemObj => itemObj.id !== item.id)
                .concat({ ...item, status: iconAndStatus.status, icon: iconAndStatus.icon });
            return [ ...newItems ];
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
                                {items
                                    .filter(itemObj => itemObj.status === statusObj.status)
                                    .map((itemObj, idNr) => <Item key={itemObj.id} item={itemObj} index={idNr} moveItem={moveItem} status={statusObj} statusId={statusId} handleItemButtonMove={handleItemButtonMove} handleDescChange={handleDescChange} handleTitleChange={handleTitleChange} handleCommentSave={handleCommentSave} handleCommentChange={handleCommentChange} handleArchiveCard={handleArchiveCard}/>)
                                }
                                <p id={statusId} className="add-btn" onClick={() => addItem(statusId)}><a><FontAwesomeIcon icon={faPlus}/> Add a card</a></p>
                            </Col>
                        </DropWrapper>
                    </div>
                );
            })}
        </div>
    );
};

export default Homepage;