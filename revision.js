const slot1 = document.getElementById("slot_1");
const slot2 = document.getElementById("slot_2");
const slot3 = document.getElementById("slot_3");
const demoEl = document.getElementById("demo");

let ItemArray = ["2", "1", ];


function getRandom() {
   return ItemArray[Math.floor(Math.random() * ItemArray.length)]
}

function spin() {
  slot1.textContent = getRandom();
  slot2.textContent = getRandom();
  slot3.textContent = getRandom();
  if (slot1.textContent === "2" && slot2.textContent === "2" && slot3.textContent === "2" ) {
    demoEl.textContent = "YOU WIN!";
    document.body.style.background = "lightblue";
    document.body.style.transition = "0.5s";
  } else {
    demoEl.textContent = "TRY AGAIN";
    document.body.style.background = "crimson";
    document.body.style.transition = "0.5s";
  }
}
