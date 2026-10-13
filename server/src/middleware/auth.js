import jwt from "jsonwebtoken";
export function requireAdmin(db, secret) {
  return async (req, res, next) => {
    const authorization = req.get("authorization") || "";
    if (!/^Bearer \S+$/.test(authorization))
      return res.status(401).json({ error: "Authentication required" });
    let token;
    try {
      token = jwt.verify(authorization.slice(7), secret, {
        algorithms: ["HS256"],
        issuer: "90s-cms",
        audience: "90s-admin",
      });
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    if (typeof token.sub !== "string")
      return res.status(401).json({ error: "Invalid token" });
    try {
      const admin = await db.admin.findUnique({
        where: { id: token.sub },
        select: { id: true, email: true, name: true },
      });
      if (!admin) return res.status(401).json({ error: "Invalid admin" });
      req.admin = admin;
      next();
    } catch (error) {
      next(error);
    }
  };
}
