const { Thought } = require('../models/Thought');
const { User } = require('../models/User');

module.exports = {
   
    getThoughts(req, res) {
        Thought.find()
            .then((thoughts) => res.json(thoughts))
            .catch((err) => res.status(500).json(err));
    },
   
    getOneThought(req, res) {
        Thought.findOne({ _id: req.params.thoughtId })
            .select('-__v')
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'No thought with this ID' })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },
    
    createThought(req, res) {
        Thought.create(req.body)
            .then((thought) => User.findOneAndUpdate(
                { username: req.body.username },
                { $push: { thoughts: thought._id } },
                { new: true }
            ))
            .then((user) => {
                !user
                    ? res.status(404).json({ message: "No user found to add this thought to" })
                    : res.json({ message: "Thought created and attached to user" })
            })
            .catch((err) => {
                return res.status(500).json(err);
            });
    },
  
    deleteThought(req, res) {
        Thought.findOneAndDelete({ _id: req.params.thoughtId })
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'No thought with this ID' })
                    : User.findOneAndUpdate(
                        { thoughts: req.params.thoughtId },
                        { $pull: { thoughts: req.params.thoughtId } },
                        { new: true }
                    ))
            .then((user) => {
                !user
                    ? res.status(404).json({ message: 'Thought deleted but no user found with ID' })
                    : res.json({ message: 'Thought deleted succesfully' })
            })
            .catch((err) => res.status(500).json(err));
    },
   
    updateThought(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'No thought with this ID' })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },
   
    addReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'No thought exists with this ID' })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err))
    },
  
    removeReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { runValidators: true, new: true }
        )
        .then((thought) => {
            !thought
            ? res.status(404).json({ message: 'No thought exists with this ID' })
            : res.json(thought)
        })
        .catch((err) => { res.status(500).json(err) } )
    }
};