let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('pending', { autoIncrement: true });
};
request.onerror = function(event) {
    console.log(event.target.errorCode);
};
function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('pending');
    budgetObjectStore.add(record);
}

function uploadPending() {
    const transaction = db.transaction(['pending'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('pending');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function () {

        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json() )
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['pending'], 'readwrite');
                    const budgetObjectStore = transaction.objectStore('pending');
                    budgetObjectStore.clear();

                    alert('All saved transactions have been submitted');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        const transaction = db.transaction(['pending'], 'readwrite');
        uploadPending();
    }
};

window.addEventListener('online', uploadPending);