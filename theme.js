let draggableElement;
let initialX;
let initialY;

function startDrag(event) {
  if (event.type === "mousedown" || event.type === "touchstart") {
    event.preventDefault(); // Prevent default action for touch events
  }

  const elm =
    event.type === "mousedown" ? event.target : event.touches[0].target;

  if (elm.classList.contains("draggable")) {
    const offsetX =
      event.type === "mousedown"
        ? event.clientX - elm.getBoundingClientRect().left
        : event.touches[0].clientX - elm.getBoundingClientRect().left;
    const offsetY =
      event.type === "mousedown"
        ? event.clientY - elm.getBoundingClientRect().top
        : event.touches[0].clientY - elm.getBoundingClientRect().top;

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

    const clientX =
      event.type === "mousemove" ? event.clientX : event.touches[0].clientX;
    const clientY =
      event.type === "mousemove" ? event.clientY : event.touches[0].clientY;

    const newX = clientX - offsetX > 0 ? clientX - offsetX : 0;
    const newY = clientY - offsetY > 0 ? clientY - offsetY : 0;

    draggableElement.style.transform = `translate(${newX}px, ${newY}px)`;
    draggableElement.style.zIndex = `5`;
  }
}

function drop(event) {
  if (draggableElement) {
    const clientX =
      event.type === "mouseup"
        ? event.clientX
        : event.changedTouches[0].clientX;
    const clientY =
      event.type === "mouseup"
        ? event.clientY
        : event.changedTouches[0].clientY;
    const gridTop = grid.getBoundingClientRect().top;
    const offsetX = parseFloat(draggableElement.getAttribute("data-offset-x"));

    const elements = document.querySelectorAll(".draggable");

    const isOverlap = checkOverlap(draggableElement);

    const rowIndex = Math.floor((clientY - gridTop) / 24);
    const newY = rowIndex * 24;

    console.log(isOverlap);
    if (!isOverlap) {
      // Calculate the new position of the draggable element

      const near = areElementsNear(draggableElement);
      let newX = initialX;

      if (near) {
        const rect = near.element.getBoundingClientRect();
        if (near.isLeft) {
          newX = rect.left - draggableElement.offsetWidth;
        } else {
          newX = rect.right;
        }
      } else {
        newX = clientX - offsetX > 0 ? clientX - offsetX : 0;

        if (newX < 60) {
          newX = 0;
        }
      }

      draggableElement.style.transform = `translate(${newX}px, ${newY}px)`;
    } else if (isOverlap.length > 1) {
      draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
    } else {
      const position = getHorizontalPosition(draggableElement, isOverlap[0]);
      const rect = isOverlap[0].getBoundingClientRect();

      if (position.p === "left") {
        if (position.overlapX < isOverlap[0].offsetWidth / 2) {
          draggableElement.style.transform = `translate(${
            rect.left - draggableElement.offsetWidth
          }px, ${newY}px)`;
        } else {
          draggableElement.style.transform = `translate(${rect.left}px, ${newY}px)`;
        }

        const overlaps1 = [];
        elements.forEach((elm) => {
          if (elm !== draggableElement) {
            const isOverlap = checkOverlap(draggableElement, elm);
            if (isOverlap) {
              overlaps1.push(elm);
            }
          }
        });

        if (overlaps1.length || rect.left - draggableElement.offsetWidth < 0) {
          draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
        }
      } else {
        if (position.overlapX < isOverlap[0].offsetWidth / 2) {
          draggableElement.style.transform = `translate(${rect.right}px, ${newY}px)`;
        } else {
          draggableElement.style.transform = `translate(${
            rect.right - isOverlap[0].offsetWidth
          }px, ${newY}px)`;
        }
        const overlaps1 = [];
        elements.forEach((elm) => {
          if (elm !== draggableElement) {
            const isOverlap = checkOverlap(draggableElement, elm);
            if (isOverlap) {
              overlaps1.push(elm);
            }
          }
        });

        if (
          overlaps1.length ||
          rect.right + draggableElement.offsetWidth > window.innerWidth
        ) {
          draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
        }
      }
    }

    // default value
    draggableElement.style.zIndex = `1`;
    draggableElement = null;
    initialX = null;
    initialY = null;
  }
}

function checkOverlap(draggable) {
  const rect1 = draggable.getBoundingClientRect();
  const elements = document.querySelectorAll(".draggable");
  let maxOverlap = 0;
  let elementWithMaxOverlap = null;

  elements.forEach((elm) => {
    if (elm !== draggable) {
      const rect2 = elm.getBoundingClientRect();

      const horizontalOverlap =
        rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x;
      const verticalOverlap =
        rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;

      if (horizontalOverlap && verticalOverlap) {
        const overlapArea =
          Math.min(rect1.x + rect1.width, rect2.x + rect2.width) -
          Math.max(rect1.x, rect2.x);
        if (overlapArea > maxOverlap) {
          maxOverlap = overlapArea;
          elementWithMaxOverlap = elm;
        }
      }
    }
  });

  if (elementWithMaxOverlap) {
    return [elementWithMaxOverlap];
  } else {
    return false;
  }
}

function getHorizontalPosition(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  const overlapX = Math.max(
    0,
    Math.min(rect1.x + rect1.width, rect2.x + rect2.width) -
      Math.max(rect1.x, rect2.x)
  );

  if (rect1.x < rect2.x) {
    return { p: "left", overlapX };
  } else if (rect1.x > rect2.x) {
    return { p: "right", overlapX };
  } else {
    return "overlap"; // Elements have the same x position
  }
}

function areElementsNear(draggable) {
  const rect1 = draggable.getBoundingClientRect();

  const threshold = 60 + draggable.offsetWidth;
  const elements = document.querySelectorAll(".draggable");
  const nears = [];

  elements.forEach((elm) => {
    if (elm !== draggable) {
      const rect2 = elm.getBoundingClientRect();
      const distanceX = Math.abs(
        (rect1.left + rect1.right) / 2 - (rect2.left + rect2.right) / 2
      );
      const distanceY = Math.abs(
        (rect1.top + rect1.bottom) / 2 - (rect2.top + rect2.bottom) / 2
      );

      const isNearX = distanceX < threshold && distanceY < 20;
      const isLeft =
        (rect2.left + rect2.right) / 2 > (rect1.left + rect1.right) / 2;

      if (isNearX) {
        nears.push({ element: elm, isLeft: isLeft });
      }
    }
  });

  if (nears.length) {
    // Find the nearest element

    nears.sort((a, b) => {
      const distanceA = Math.abs(
        (rect1.left + rect1.right) / 2 -
          (a.element.getBoundingClientRect().left +
            a.element.getBoundingClientRect().right) /
            2
      );

      const distanceB = Math.abs(
        (rect1.left + rect1.right) / 2 -
          (b.element.getBoundingClientRect().left +
            b.element.getBoundingClientRect().right) /
            2
      );

      return distanceA - distanceB;
    });

    return nears[0];
  } else {
    return false;
  }
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

  // Add touch event listeners
  grid.addEventListener("touchstart", startDrag);
  grid.addEventListener("touchmove", drag);
  grid.addEventListener("touchend", drop);
});

// Rest of your code...
