module.exports = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL || "arqdoor@admin.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD || "6aseqcx13zerq513";

  const authHeader = req.headers.authorization || "";
  let email = null;
  let password = null;

  if (authHeader.toLowerCase().startsWith("basic ")) {
    const base64 = authHeader.split(" ")[1];
    const decoded = Buffer.from(base64, "base64").toString("utf8");
    const [user, pass] = decoded.split(":");
    email = user;
    password = pass;
  }

  if (email === adminEmail && password === adminPassword) {
    return next();
  }

  return res.status(401).json({
    code: 401,
    success: false,
    message: "Admin não autorizado",
  });
};
