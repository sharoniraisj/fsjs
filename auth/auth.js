function checkAuth(req, res, next) {

    const token = req.get("authorization").split(" ")[1]; //hay un espacio

    jwt.verify(token, jwtKey, (err, decoded) => {
        if(err) {
            console.error(err.stack);
            res.status(401).json({ "error": "Auth failed." });
        }else {
            next();
        }
        return;
    });
}
module.exports = checkAuth;
