
function send() {
    let volume;
    let issue;
    if(new Date().getMonth() >=0 && new Date().getMonth() <= 3) {
        volume =1;
        if(new Date().getMonth() == 0 ) {
            issue = 1;
        }
        else if(new Date().getMonth() == 1 ) {
            issue = 2;
        }
        else if(new Date().getMonth() == 2 ) {
            issue = 3;
        }
    }
    else if(new Date().getMonth() >=4 && new Date().getMonth() <= 6) {
        volume =2;
        if(new Date().getMonth() == 3 ) {
            issue = 1;
        }
        else if(new Date().getMonth() == 4 ) {
            issue = 2;
        }
        else if(new Date().getMonth() == 5 ) {
            issue = 3;
        }
        
    }
    else if(new Date().getMonth() >=7 && new Date().getMonth() <= 9) {
        volume =3;
        if(new Date().getMonth() == 6 ) {
            issue = 1;
        }
        else if(new Date().getMonth() == 7 ) {
            issue = 2;
        }
        else if(new Date().getMonth() == 8 ) {
            issue = 3;
        }
    }
    else if(new Date().getMonth() >=10 && new Date().getMonth() <= 12) {
        volume =4;
        if(new Date().getMonth() == 9 ) {
            issue = 1;
        }
        else if(new Date().getMonth() == 10 ) {
            issue = 2;
        }
        else if(new Date().getMonth() == 11 ) {
            issue = 3;
        }
    }
    return { volume, issue };
    
}

module.exports = send;