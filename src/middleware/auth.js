const requireApiLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    return next();
};

const requirePageLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    return next();
};

const requireApiRole = (role) => (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.session.user.role !== role) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
};

const requirePageRole = (role) => (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (req.session.user.role !== role) {
        return res.status(403).render('errors/403', { title: 'Access Denied' });
    }
    return next();
};

export { requireApiLogin, requirePageLogin, requireApiRole, requirePageRole };
