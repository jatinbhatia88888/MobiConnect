export const isAuthenticated = (req, res, next) => {
  if (!req.session.username) {
    console.log("No username in session, redirecting...");
    return res.redirect("http://localhost:5173/profile");
  }

  if (req.session.userId) return next();

  console.log(`Blocked: ${req.session.userId}`);
  console.log("Checking session object:");
  console.dir(req.session);

  res.status(400).json({ error: 'Session invalid.' });
};
