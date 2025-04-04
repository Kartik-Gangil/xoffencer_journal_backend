
function send() {
    let volume;
    let issue;
    let month = new Date().getMonth(); // Get the current month (0-based)

    if (month >= 0 && month <= 2) { // Q1 (Jan - Mar)
        volume = 4;
        issue = month + 1; // Jan = 0 -> Issue 1, Feb = 1 -> Issue 2, Mar = 2 -> Issue 3
    }
    else if (month >= 3 && month <= 5) { // Q2 (Apr - Jun)
        volume = 1;
        issue = month - 2; // Apr = 3 -> Issue 1, May = 4 -> Issue 2, Jun = 5 -> Issue 3
    }
    else if (month >= 6 && month <= 8) { // Q3 (Jul - Sep)
        volume = 2;
        issue = month - 5; // Jul = 6 -> Issue 1, Aug = 7 -> Issue 2, Sep = 8 -> Issue 3
    }
    else if (month >= 9 && month <= 11) { // Q4 (Oct - Dec)
        volume = 3;
        issue = month - 8; // Oct = 9 -> Issue 1, Nov = 10 -> Issue 2, Dec = 11 -> Issue 3
    }
    return { volume, issue };
    
}

module.exports = send;