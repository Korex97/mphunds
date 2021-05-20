module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please Log in to view this resource');
        res.redirect('/login');
    },
    vendorAuthenticated: (req, res, next) => {
        console.log(req.isAuthenticated());
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please Log in to view this resource');
        res.redirect('/vendors/vendor-login');
    }
}