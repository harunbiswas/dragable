let draggableElement;
let initialX;
let initialY;

function startDrag(event) {
  const elm = event.target;
  if (elm.classList.contains("draggable")) {
    const offsetX = event.clientX - elm.getBoundingClientRect().left;
    const offsetY = event.clientY - elm.getBoundingClientRect().top;
    elm.setAttribute("data-offset-x", offsetX);
    elm.setAttribute("data-offset-y", offsetY);
    initialX = elm.getBoundingClientRect().left;
    initialY = elm.getBoundingClientRect().top;
    draggableElement = elm;
  } else {
    draggableElement = null;
    initialX = null;
    initialY = null;
  }
}

function drag(event) {
  if (draggableElement) {
    const offsetX = parseFloat(draggableElement.getAttribute("data-offset-x"));
    const offsetY = parseFloat(draggableElement.getAttribute("data-offset-y"));
    const newX = event.clientX - offsetX > 0 ? event.clientX - offsetX : 0;
    const newY = event.clientY - offsetY > 0 ? event.clientY - offsetY : 0;

    draggableElement.style.transform = `translate(${newX}px, ${newY}px)`;
  }
}

function drop(event) {
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  const offsetX = parseFloat(draggableElement.getAttribute("data-offset-x"));

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

    if (!isOverlap && isOverlap !== 0) {
      draggableElement.style.transform = `translate(${isOverlap}px, ${rect.top}px)`;
    } else {
      draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
    }
  } else {
    const columnIndex = Math.floor(
      (mouseX - grid.offsetLeft) / draggableElement.offsetWidth
    );

    const rowIndex = Math.floor((mouseY - gridTop) / 24);

    // Calculate the new position of the draggable element
    const newX = event.clientX - offsetX > 0 ? event.clientX - offsetX : 0;
    const newY = rowIndex * 24;

    // Check if the new position is valid (not overlapping with other elements)
    const isOverlap = checkOverlap(draggableElement, newX, newY);

    if (!isOverlap && isOverlap !== 0) {
      const nearbyDivs = document.elementsFromPoint(newX - 60, newY);
      const closestDiv1 = findClosestDiv(draggableElement, nearbyDivs);

      if (closestDiv1) {
        const rect = closestDiv1.getBoundingClientRect();
        draggableElement.style.transform = `translate(${rect.right}px, ${newY}px)`;
      } else {
        const nearbyDivs = document.elementsFromPoint(
          newX + draggableElement.offsetWidth + 60,
          newY
        );
        const closestDiv1 = findClosestDiv(draggableElement, nearbyDivs);
        if (closestDiv1) {
          const rect = closestDiv1.getBoundingClientRect();
          draggableElement.style.transform = `translate(${
            rect.left - draggableElement.offsetWidth
          }px, ${newY}px)`;
        } else {
          draggableElement.style.transform = `translate(${newX}px, ${newY}px)`;
          draggableElement = null;
          initialX = null;
          initialY = null;
        }
      }
    } else {
      const overlap1 = checkOverlap(draggableElement, isOverlap, newY);

      if (!overlap1 && overlap1 !== 0) {
        const overlap2 = checkOverlap(draggableElement, isOverlap, newY);

        if (!overlap2 && overlap2 !== 0) {
          draggableElement.style.transform = `translate(${isOverlap}px, ${newY}px)`;
        }
      } else {
        draggableElement.style.transform = `translate(${overlap1}px, ${newY}px)`;
      }
    }
  }

  draggableElement = null;
  initialX = null;
  initialY = null;

  // draggableElement.style.position = "absolute";
  // draggableElement.style.zIndex = "1";
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
    // draggable.setAttribute("draggable", "true");
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

    return draggable;
  }
  grid.addEventListener("mousedown", startDrag);
  // grid.addEventListener("mousemove", moving);
  grid.addEventListener("mousemove", drag);

  grid.addEventListener("mouseup", drop);
});
