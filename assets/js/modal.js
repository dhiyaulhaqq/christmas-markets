const pickDateModal = document.getElementById('pick-date-modal');
const pickDate = document.getElementById('pick-date');
const filterButton = document.getElementById('filter-btn');
let inputDate;

// Open the modal
function ioOpenModal() {
    pickDateModal.classList.remove("d-none");
}

// Close the modal
function ioCloseModal() {
    pickDateModal.classList.add("d-none");
}

// Close the modal if the user clicks outside the modal content
window.onclick = function (event) {
    if (event.target === pickDateModal) {
        pickDateModal.classList.add("d-none");
    }
}

flatpickr(pickDate, {});

pickDate.addEventListener("change", (event) => {
    // retrieve the input value
    const dateValue = event.target.value;

    // convert the text value into date object
    const date = new Date(dateValue);

    inputDate = date;
})

filterButton.addEventListener("click", () => {
    if (inputDate) {
        // close the modal
        ioCloseModal();

        // show filter list by date
        ioFilterByDate(inputDate);
    }
})

