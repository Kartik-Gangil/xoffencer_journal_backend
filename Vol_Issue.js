
function send(date) {
    let volume;
    let issue;
    let year = new Date(date).getFullYear();
    let month = new Date(date).getMonth();
    let startYear = 2025;
    volume = year - startYear + 1;

    if (month >= 0 && month <= 3) {         // Jan - Apr
        issue = 1;
    } else if (month >= 4 && month <= 7) {  // May - Aug
        issue = 2;
    } else {                                // Sep - Dec
        issue = 3;
    }
    console.log({ volume, issue })
    return { volume, issue };

}

module.exports = send;