const Router = require('express').Router;
const userControllers = require('../controllers/user-controller');
const AdminController = require('../controllers/admin-controller');

const router = new Router();

const { body } = require('express-validator');
const authMiddleWare = require('../middlewares/auth-middleware');
const adminMiddleWare = require('../middlewares/admin-middleware');


router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    userControllers.registration);
router.post('/login', userControllers.login);
router.post('/logout', userControllers.logout);
router.post('/revalidation_mail', userControllers.reValidationMail)
router.post('/upload_avatar', userControllers.uploadAvatar)

router.get('/activate/:link', userControllers.activate);
router.get('/refresh', userControllers.refresh);
router.get('/get_lecturer',  userControllers.getLecturer);
router.get('/get_lessons_for_user',authMiddleWare, userControllers.getLessonsData);
router.get('/get_course', userControllers.getCourse);
router.get('/get_courses', userControllers.getCourses);
router.get('/get_activites',  adminMiddleWare, AdminController.getActivites);
router.get('/get_lecturers', adminMiddleWare, AdminController.getLecruters);
router.get('/get_user',  adminMiddleWare, AdminController.getUser);
router.get('/get_users',  adminMiddleWare, AdminController.getUsers);
router.get('/create_new_record_activities', adminMiddleWare, AdminController.createNewRecordActivities)
router.get('/private_images/:imageName', authMiddleWare, userControllers.getPrivateImage);


module.exports = router