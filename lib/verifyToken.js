export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Specify the decoded token type
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).send("Invalid token");
    }

    req.userId = decoded.userId;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({ message: "Unauthorized" });
  }
};
