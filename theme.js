function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  const draggableElement = event.target;

  // Get the offset between the mouse position and the top-left corner of the draggable element
  const offsetX = event.clientX - draggableElement.getBoundingClientRect().left;
  const offsetY = event.clientY - draggableElement.getBoundingClientRect().top;

  // Set the offset as a data attribute on the draggable element
  draggableElement.setAttribute("data-offset-x", offsetX);
  draggableElement.setAttribute("data-offset-y", offsetY);

  event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
  event.preventDefault();
  const data = event.dataTransfer.getData("text");
  const draggableElement = document.getElementById(data);

  const mouseX = event.clientX;
  const mouseY = event.clientY;

  const gridTop = grid.getBoundingClientRect().top;

  // Check for nearby divs on the same row
  const nearbyDivs = document.elementsFromPoint(mouseX, mouseY);
  const closestDiv = findClosestDiv(draggableElement, nearbyDivs);

  if (closestDiv) {
    const rect = closestDiv.getBoundingClientRect();

    // Determine the appropriate width for the draggable element
    const newWidth = closestDiv.classList.contains("orange") ? 80 : 60;

    // Calculate the new X position
    const newX = rect.left + newWidth;

    // Check if the new position is valid (not overlapping with other elements)
    const isOverlap = checkOverlap(draggableElement, newX - newWidth, rect.top);
    if (!isOverlap) {
      draggableElement.style.transform = `translate(${newX - newWidth}px, ${
        rect.top
      }px)`;
    }
  } else {
    const columnIndex = Math.floor(
      (mouseX - grid.offsetLeft) / draggableElement.offsetWidth
    );

    const rowIndex = Math.floor((mouseY - gridTop) / 24);

    const offsetX = parseFloat(draggableElement.getAttribute("data-offset-x"));

    // Calculate the new position of the draggable element
    const newX = event.clientX - offsetX;
    const newY = rowIndex * 24;

    // Check if the new position is valid (not overlapping with other elements)
    const isOverlap = checkOverlap(draggableElement, newX, newY);
    if (!isOverlap) {
      draggableElement.style.transform = `translate(${newX}px, ${newY}px)`;
    } else {
      draggableElement.style.transform = `translate(${isOverlap}px, ${newY}px)`;
    }
  }

  draggableElement.style.position = "absolute";
  draggableElement.style.zIndex = "1";
}

function checkOverlap(draggableElement, newX, newY) {
  const draggableRect = draggableElement.getBoundingClientRect();

  // Check for nearby divs on the same row
  const nearbyDivs = document.elementsFromPoint(
    newX + draggableRect.width,
    newY + draggableRect.height / 2
  );

  const closestDiv = findClosestDiv(draggableElement, nearbyDivs);

  if (closestDiv) {
    const rect = closestDiv.getBoundingClientRect();

    if (
      newX < rect.right &&
      newX + draggableRect.width > rect.left &&
      newY < rect.bottom &&
      newY + draggableRect.height > rect.top
    ) {
      // Overlapping

      return rect.left - draggableElement.offsetWidth;
    }
  } else {
    // Check for nearby divs on the same row
    const nearbyDivs1 = document.elementsFromPoint(
      newX,
      newY + draggableRect.height / 2
    );

    const closestDiv = findClosestDiv(draggableElement, nearbyDivs1);
    if (closestDiv) {
      const rect = closestDiv.getBoundingClientRect();

      if (
        newX < rect.right &&
        newX + draggableRect.width > rect.left &&
        newY < rect.bottom &&
        newY + draggableRect.height > rect.top
      ) {
        // Overlapping
        return rect.right;
      }
    }

    return false;
  }

  // Not overlapping
  return false;
}

function findClosestDiv(draggableElement, nearbyDivs) {
  let minDistance = Infinity;
  let closestDiv = null;

  const draggableRect = draggableElement.getBoundingClientRect();

  for (const element of nearbyDivs) {
    if (
      element !== draggableElement &&
      element.classList.contains("draggable")
    ) {
      const rect = element.getBoundingClientRect();
      const distance = Math.abs(rect.left - draggableRect.right);

      if (distance < minDistance) {
        minDistance = distance;
        closestDiv = element;
      }
    }
  }

  return closestDiv;
}

document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("grid");

  for (let i = 0; i < 50; i++) {
    const draggable = createDraggable(i);
    grid.appendChild(draggable);
  }

  function createDraggable(index) {
    const draggable = document.createElement("div");
    draggable.className = "draggable";
    draggable.id = "draggable" + index;
    draggable.setAttribute("draggable", "true");
    draggable.textContent = "Truck";

    // Set width based on classname
    if (index % 2 === 0) {
      draggable.classList.add("orange");
    } else {
      draggable.classList.add("grey");
      draggable.textContent = "Paver";
    }

    // Set initial position based on index
    const initialX = index % 2 === 0 ? 0 : 80;
    const initialY = Math.floor(index / 2) * 24;
    draggable.style.transform = `translate(${initialX}px, ${initialY}px)`;

    draggable.addEventListener("dragstart", drag);

    return draggable;
  }

  grid.addEventListener("dragover", allowDrop);
  grid.addEventListener("drop", drop);
});
