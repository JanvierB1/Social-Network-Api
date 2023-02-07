const router = require('express').Router();

const { getUsers, getOneUser, createUser, deleteUser, updateUser, addFriend, removeFriend } = require('../../controllers/userController')

router.route('/').get(getUsers).post(createUser);

router.route('/:userId').get(getOneUser).delete(deleteUser).put(updateUser);

router.route('/:userId/friends/:friendId').post(addFriend).delete(removeFriend);

module.exports = router;