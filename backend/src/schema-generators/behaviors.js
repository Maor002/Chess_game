const logger = require('../logger/logger');

module.exports = {
    preSave: function (next) {
        logger.info("🔹 Pre-save hook executed");
        
        // Handle timestamps for detail object
        const now = new Date();
        
        if (!this.detail) {
            this.detail = {};
        }
        
        this.detail.updatedAt = now;
        
        if (this.isNew && !this.detail.createdAt) {
            this.detail.createdAt = now;
        }
        
        this.markModified('detail');
        logger.debug("Detail after pre-save:", this.detail);
        next();
    },
    
    print: function () {
        logger.info(`🔹 User: ${this.username}, Email: ${this.email}`);
    },
    
    isOnline: function () {
        return this.status === 'online';
    },
    
    generateRoomCode: async function () {
        const Room = require('mongoose').model('Room');
        let code;
        let existingRoom;
        do {
            code = Math.floor(100000 + Math.random() * 900000).toString();
            existingRoom = await Room.findOne({ code });
        } while (existingRoom);
        return code;
    }
};