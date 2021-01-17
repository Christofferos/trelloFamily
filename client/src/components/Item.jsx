import React, { Fragment, useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import Window from "./Window";
import ITEM_TYPE from "../data/types";

// This is responsible for moving items within or between trello columns.
const Item = ({ item, index, moveItem, status, statusId, handleItemButtonMove, handleDescChange, handleTitleChange, handleCommentSave, handleCommentChange, handleArchiveCard }) => {
    const ref = useRef(null);

    // useDrop hook.
    const [, drop] = useDrop({
        accept: ITEM_TYPE,
        hover(item, monitor) {
            if (!ref.current) {
                return
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) {
                return
            }

            const hoveredRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoveredRect.bottom - hoveredRect.top) / 2;
            const mousePosition = monitor.getClientOffset();
            const hoverClientY = mousePosition.y - hoveredRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            moveItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    // useDrag hook.
    const [{ isDragging }, drag] = useDrag({
        item: { type: ITEM_TYPE, ...item, index },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    const [show, setShow] = useState(false);

    const onOpen = () => setShow(true);

    const onClose = () => setShow(false);

    drag(drop(ref));

    return (
        <Fragment>
            <div
                ref={ref}
                style={{ opacity: isDragging ? 0 : 1 }}
                className={"item"}
                onClick={onOpen}
            >
                <div className={"color-bar"} style={{ backgroundColor: status.color }}/>
                <p className={"item-title"}>{item.title}</p>
                <p className={"item-status"}>{item.icon}</p>
            </div>
            <Window
                item={item}
                onClose={onClose}
                show={show}
                statusId={statusId}
                handleItemButtonMove={handleItemButtonMove}
                handleDescChange={handleDescChange}
                handleTitleChange={handleTitleChange}
                handleCommentSave={handleCommentSave}
                handleCommentChange={handleCommentChange}
                handleArchiveCard={handleArchiveCard}
            />
        </Fragment>
    );
};

export default Item;