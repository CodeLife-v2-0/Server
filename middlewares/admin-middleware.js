const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');

module.exports = function(req, res, next){
    try{
        const authorizationHeader = req.headers.authorization;
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError());
        }
        const accsessToken = authorizationHeader.split(' ')[1];
        if(!accsessToken){
            return next(ApiError.UnauthorizedError());
        }
        const userData = tokenService.validateAccessToken(accsessToken);
        if(!userData){
            return next(ApiError.UnauthorizedError());
        }
        if(userData.role!=='Admin'){
            return next(ApiError.InsufficientAccessRights());
        }
        req.user = userData;
        next();

    }catch(error){
        return next(ApiError.UnauthorizedError());
    }
};