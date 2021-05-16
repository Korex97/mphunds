module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash('error_meg', 'Please Log in to view this resource');
        res.redirect('/login');
    }
}