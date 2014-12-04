
module.exports = {
	createThread: createThread,
	createMessage: createMessage,
	lookupMessages: lookupMessages,
    findThreadsByUser: findThreadsByUser
};

var q = require('q');
var MessageThread = require('../models/thread');
var Message = require('../models/message');

function createThread(userId, title, tags) {
	var defer = q.defer();

	var userEntry = {
		user: userId,
		createdThread: true
	};

	var t = new MessageThread();
    
    t.users = [];
    t.users.push(userEntry);
    t.title = title
    t.tags = tags;
    
    t.save(function(err, thread){
        if(err){
            defer.reject(err);
        } else {
        	defer.resolve(thread);
        }
    }); 

    return defer.promise;
};

function findThreadsByUser(userId) {
    return MessageThread
            .find({'users.user':userId})
           .exec(); 
};

function createMessage(threadId, message) {
	var defer = q.defer();

	MessageThread.findOne({_id:threadId}).exec()
        .then(function(thread){
            var msg = new Message();
            msg.user = message.user;
            msg.messageText = message.text;
            thread.messages.push(msg);
            thread.save(function(err, thread){
            	if (err) {
            		defer.rejet(err);
            	} else {
            		defer.resolve(msg);
            	}
            });
        }, function(err) {
        	defer.reject(err);
        });

    return defer.promise;
};

// TODO
function lookupMessages(threadId, minTimestamp) {
	var defer = q.defer();
	defer.resolve([]);
	return defer.promise;
};



