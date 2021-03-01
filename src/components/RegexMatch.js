export default Regex = {
    VALID_NAME : "^[a-zA-Z ]+$",
    VALID_EMAIL : "^[\\w-\\+]+(\\.[\\w]+)*@[\\w-]+(\\.[\\w]+)*(\\.[a-z]{2,})$",
    VALID_PASSWORD : "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,20}$",   
    // in this case : 6 char; 1 number, 1 l-case, 1 u-case letters
}