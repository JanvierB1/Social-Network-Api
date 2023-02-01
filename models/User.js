const { Schema, model } = require('mongoose');
const { Thought, thoughtSchema } = require('./Thought');

const userSchema = new Schema(
    {
     username: {
        type: String,
        required: [true , 'Username is required'],
        unique: true,
        trim: true,
        },
    email: {
        type: String,
        required: [true , 'User requires an email'],
        unique: true,
        //REGEX
        validate: {
             validator: function (e) {
                return /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(e);
                },
            message: email => `${email.value} is not a valid email!`
            }
        },
    thoughts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Thought',
        },
    ],
    friends: [
        {
            type: Schema.Types.ObjectId,
             ref: 'User',
        },
    ],
},
    {
        toJSON: {
            getters: true,
            virtuals: true,
        },
        id: false
    }
);

userSchema.post('find', function () {
    if (this.options._recursed) {
        return;
    }
    this.populate({ path: 'thoughts friends', options: { _recursed: true } });
    return;
})

userSchema.virtual('friendCount').get(function () {
    return this.friends.length;
});

const User = model('user', userSchema);

module.exports = { User };