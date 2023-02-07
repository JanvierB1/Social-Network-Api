const { ObjectId } = require('mongoose').Types;
const { Thought } = require('../models/Thought');
const { User } = require('../models/User');

const friendFinder = async (id) => {

    let f = await User.find(
        { friends: id },
        { new: true }
    )

    if (f) {
        for (let i = 0; i < f.length; i++) {
            await User.findOneAndUpdate(
                { friends: id },
                { $pull: { friends: id } },
                { new: true }
            )
        }
    } else {
        return false;
    }

    return true;
}

module.exports = {
  
    getUsers(req, res) {
        User.find()
            .select('-__v')
            .then(async (users) => {
                return res.json(users);
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },
   
    getOneUser(req, res) {
        User.findOne({ _id: req.params.userId })
            .select('-__v')
            .then(async (user) =>
                !user ? res.status(404).json({ message: 'No users found by the ID' })
                    : res.json({ user }))
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },
  
    createUser(req, res) {
        User.create(req.body)
            .then((user) => res.json(user))
            .catch((err) => res.status(500).json(err))
    },
   
    updateUser(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
            .then((user) =>
                !user
                    ? res.status(404).json({ message: 'No user exists by the ID' })
                    : res.json(user)
            )
            .catch((err) => { res.status(500).json(err) })
    },
   
    deleteUser(req, res) {
        User.findOneAndDelete({ _id: req.params.userId })
            .then((user) =>
                !user
                    ? res.status(404).json({ message: 'No user exists by the ID' })
                    
                    : Thought.deleteMany({ username: user.username })
            )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'User deleted but no thoughts found' })
                   
                    : friendFinder(req.params.userId)
                        .then((friends) =>
                            !friends
                                ? res.json({ message: 'User succesfully deleted and no matching friends found' })
                                : res.json({ message: 'User succesfully deleted and removed from all friends lists' })
                        )
            )
            .catch((err) => { res.status(500).json(err); })
    },
    
    addFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $addToSet: { friends: req.params.friendId } },
            { new: true }
        )
            .then((user) =>
                !user
                    ? res.status(404).json({ message: 'No user exists by the ID' })
                    : User.findOneAndUpdate(
                        { _id: req.params.friendId },
                        { $addToSet: { friends: req.params.userId } },
                        { new: true }
                    )
                        .then((friends) =>
                            !friends
                                ? res.status(404).json({ message: `Added ${friends.username} to friends but unable to add back.` })
                                : res.json({ message: 'Friend has been succesfully added' })
                        )
            )
            .catch((err) => res.status(500).json(err))
    },
    removeFriend(req, res) {
        User.findOneAndUpdate(
            { _id: req.params.userId },
            { $pull: { friends: req.params.friendId } },
            { new: true }
        )
            .then((user) =>
                !user
                    ? res.status(404).json({ message: 'No user exists by the ID' })
                    : User.findOneAndUpdate(
                        { _id: req.params.friendId },
                        { $pull: { friends: req.params.userId } },
                        { new: true }
                    )
                        .then((friends) =>
                            !friends
                                ? res.status(404).json({ message: `Added ${friends.username} to friends but unable to add back.` })
                                : res.json({ message: 'Friend has been succesfully removed' })
                        )
            )
            .catch((err) => res.status(500).json(err))
    }
}