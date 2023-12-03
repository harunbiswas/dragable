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
    const overlaps = [];
    elements.forEach((elm) => {
      if (elm !== draggableElement) {
        const isOverlap = checkOverlap(draggableElement, elm);
        if (isOverlap) {
          overlaps.push(elm);
        }
      }
    });
    const rowIndex = Math.floor((clientY - gridTop) / 24);
    const newY = rowIndex * 24;
    if (!overlaps.length) {
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
      }

      draggableElement.style.transform = `translate(${newX}px, ${newY}px)`;
    } else if (overlaps.length > 1) {
      draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
    } else {
      const position = getHorizontalPosition(draggableElement, overlaps[0]);
      const rect = overlaps[0].getBoundingClientRect();

      if (position === "left") {
        draggableElement.style.transform = `translate(${
          rect.left - draggableElement.offsetWidth
        }px, ${newY}px)`;
        const overlaps1 = [];
        elements.forEach((elm) => {
          if (elm !== draggableElement) {
            const isOverlap = checkOverlap(draggableElement, elm);
            if (isOverlap) {
              overlaps1.push(elm);
            }
          }
        });

        if (overlaps1.length) {
          draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
        }
      } else {
        draggableElement.style.transform = `translate(${rect.right}px, ${newY}px)`;

        const overlaps1 = [];
        elements.forEach((elm) => {
          if (elm !== draggableElement) {
            const isOverlap = checkOverlap(draggableElement, elm);
            if (isOverlap) {
              overlaps1.push(elm);
            }
          }
        });

        if (overlaps1.length) {
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

function checkOverlap(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function getHorizontalPosition(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  if (rect1.x < rect2.x) {
    return "left";
  } else if (rect1.x > rect2.x) {
    return "right";
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

      const isNearX = distanceX < threshold;
      const isLeft =
        (rect2.left + rect2.right) / 2 > (rect1.left + rect1.right) / 2;

      if (isNearX) {
        nears.push({ element: elm, isLeft: isLeft });
      }
    }
  });

  if (nears.length) {
    return nears[0];
  } else {
    return false;
  }
}

// function drop(event) {
//   if (draggableElement) {
//     const clientX =
//       event.type === "mouseup"
//         ? event.clientX
//         : event.changedTouches[0].clientX;
//     const clientY =
//       event.type === "mouseup"
//         ? event.clientY
//         : event.changedTouches[0].clientY;

//     const offsetX = parseFloat(draggableElement.getAttribute("data-offset-x"));

//     const gridTop = grid.getBoundingClientRect().top;

//     // Check for nearby divs on the same row
//     const nearbyDivs = document.elementsFromPoint(clientX, clientY);
//     const closestDiv = findClosestDiv(draggableElement, nearbyDivs);

//     if (closestDiv) {
//       const rect = closestDiv.getBoundingClientRect();

//       // Determine the appropriate width for the draggable element
//       const newWidth = closestDiv.classList.contains("orange") ? 80 : 60;

//       // Calculate the new X position
//       const newX = rect.left + newWidth;

//       // Check if the new position is valid (not overlapping with other elements)
//       const isOverlap = checkOverlap(
//         draggableElement,
//         newX - newWidth,
//         rect.top
//       );
//       if (isOverlap === true) {
//         draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
//       } else if (!isOverlap && isOverlap !== 0) {
//         draggableElement.style.transform = `translate(${isOverlap}px, ${rect.top}px)`;
//       } else {
//         draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
//       }
//     } else {
//       const columnIndex = Math.floor(
//         (clientX - grid.offsetLeft) / draggableElement.offsetWidth
//       );

//       const rowIndex = Math.floor((clientY - gridTop) / 24);

//       // Calculate the new position of the draggable element
//       const newX = clientX - offsetX > 0 ? clientX - offsetX : 0;
//       const newY = rowIndex * 24;

//       // Check if the new position is valid (not overlapping with other elements)
//       const isOverlap = checkOverlap(draggableElement, newX, newY);
//       console.log(isOverlap);
//       if (isOverlap === true) {
//         draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
//       } else if (!isOverlap && isOverlap !== 0) {
//         const nearbyDivs = document.elementsFromPoint(newX - 60, newY);
//         const closestDiv1 = findClosestDiv(draggableElement, nearbyDivs);

//         if (closestDiv1) {
//           const rect = closestDiv1.getBoundingClientRect();
//           draggableElement.style.transform = `translate(${rect.right}px, ${newY}px)`;
//         } else {
//           const nearbyDivs = document.elementsFromPoint(
//             newX + draggableElement.offsetWidth + 60,
//             newY
//           );
//           const closestDiv1 = findClosestDiv(draggableElement, nearbyDivs);
//           if (closestDiv1) {
//             const rect = closestDiv1.getBoundingClientRect();
//             draggableElement.style.transform = `translate(${
//               rect.left - draggableElement.offsetWidth
//             }px, ${newY}px)`;
//           } else {
//             draggableElement.style.transform = `translate(${newX}px, ${newY}px)`;
//           }
//         }
//       } else {
//         const overlap1 = checkOverlap(draggableElement, isOverlap, newY);

//         if (!overlap1 && overlap1 !== 0) {
//           const overlap2 = checkOverlap(draggableElement, isOverlap, newY);

//           if (!overlap2 && overlap2 !== 0) {
//             draggableElement.style.transform = `translate(${isOverlap}px, ${newY}px)`;
//           } else {
//             draggableElement.style.transform = `translate(${initialX}px, ${initialY}px)`;
//           }
//         } else {
//           draggableElement.style.transform = `translate(${overlap1}px, ${newY}px)`;
//         }
//       }
//     }
//     draggableElement.style.zIndex = `1`;
//     draggableElement = null;
//     initialX = null;
//     initialY = null;
//   }
// }

// function checkOverlap(draggableElement, newX, newY) {
//   const draggableRect = draggableElement.getBoundingClientRect();

//   // Check for nearby divs on the same row
//   const nearbyDivs = document.elementsFromPoint(
//     newX + draggableRect.width,
//     newY + draggableRect.height / 2
//   );

//   const closestDiv = findClosestDiv(draggableElement, nearbyDivs);

//   if (closestDiv) {
//     const rect = closestDiv.getBoundingClientRect();

//     if (
//       newX < rect.right &&
//       newX + draggableRect.width > rect.left &&
//       newY < rect.bottom &&
//       newY + draggableRect.height > rect.top
//     ) {
//       // Overlapping

//       // Check for nearby divs on the same row
//       const nearbyDivs1 = document.elementsFromPoint(
//         newX,
//         newY + draggableRect.height / 2
//       );

//       const closestDiv = findClosestDiv(draggableElement, nearbyDivs1);
//       if (closestDiv) {
//         const rect = closestDiv.getBoundingClientRect();

//         if (
//           newX < rect.right &&
//           newX + draggableRect.width > rect.left &&
//           newY < rect.bottom &&
//           newY + draggableRect.height > rect.top
//         ) {
//           // Overlapping

//           return true;
//         } else {
//           return rect.left - draggableElement.offsetWidth;
//         }
//       } else {
//         return rect.left - draggableElement.offsetWidth;
//       }
//     } else {
//       return false;
//     }
//   } else {
//     // Check for nearby divs on the same row
//     const nearbyDivs1 = document.elementsFromPoint(
//       newX,
//       newY + draggableRect.height / 2
//     );

//     const closestDiv = findClosestDiv(draggableElement, nearbyDivs1);
//     if (closestDiv) {
//       const rect = closestDiv.getBoundingClientRect();

//       if (
//         newX < rect.right &&
//         newX + draggableRect.width > rect.left &&
//         newY < rect.bottom &&
//         newY + draggableRect.height > rect.top
//       ) {
//         // Overlapping

//         // Check for nearby divs on the same row
//         const nearbyDivs2 = document.elementsFromPoint(
//           newX + draggableRect.width,
//           newY + draggableRect.height / 2
//         );

//         const closestDiv1 = findClosestDiv(draggableElement, nearbyDivs2);

//         if (closestDiv1) {
//           return true;
//         } else {
//           return rect.right;
//         }
//       } else {
//         return rect.right;
//       }
//     } else {
//       return false;
//     }
//   }
// }

// function findClosestDiv(draggableElement, nearbyDivs) {
//   let minDistance = Infinity;
//   let closestDiv = null;

//   const draggableRect = draggableElement.getBoundingClientRect();

//   for (const element of nearbyDivs) {
//     if (
//       element !== draggableElement &&
//       element.classList.contains("draggable")
//     ) {
//       const rect = element.getBoundingClientRect();
//       const distance = Math.abs(rect.left - draggableRect.right);

//       if (distance < minDistance) {
//         minDistance = distance;
//         closestDiv = element;
//       }
//     }
//   }

//   return closestDiv;
// }

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
